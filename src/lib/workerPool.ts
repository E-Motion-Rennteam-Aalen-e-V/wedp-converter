import type { WorkerRequest, WorkerResponse } from "@/lib/types";

type PendingTask = {
  request: WorkerRequest;
  resolve: (res: WorkerResponse) => void;
};

/**
 * Round-robin pool of dedicated Web Workers that perform the actual
 * image decode/resize/encode work off the main thread.
 */
export class ConversionWorkerPool {
  private workers: Worker[] = [];
  private busy: boolean[] = [];
  private queue: PendingTask[] = [];
  private pendingById = new Map<string, PendingTask>();

  constructor(size = Math.min(navigator.hardwareConcurrency || 4, 6)) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL("../workers/convert.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.onWorkerMessage(i, event.data);
      this.workers.push(worker);
      this.busy.push(false);
    }
  }

  private onWorkerMessage(workerIndex: number, response: WorkerResponse) {
    this.busy[workerIndex] = false;
    const task = this.pendingById.get(response.id);
    if (task) {
      this.pendingById.delete(response.id);
      task.resolve(response);
    }
    this.dispatchNext(workerIndex);
  }

  private dispatchNext(workerIndex: number) {
    const task = this.queue.shift();
    const worker = this.workers[workerIndex];
    if (!task || !worker) return;
    this.busy[workerIndex] = true;
    this.pendingById.set(task.request.id, task);
    worker.postMessage(task.request, [task.request.buffer]);
  }

  private findFreeWorker(): number {
    return this.busy.findIndex((b) => !b);
  }

  submit(request: WorkerRequest): Promise<WorkerResponse> {
    return new Promise((resolve) => {
      const task: PendingTask = { request, resolve };
      const freeIndex = this.findFreeWorker();
      const freeWorker = freeIndex !== -1 ? this.workers[freeIndex] : undefined;
      if (freeIndex !== -1 && freeWorker) {
        this.busy[freeIndex] = true;
        this.pendingById.set(request.id, task);
        freeWorker.postMessage(request, [request.buffer]);
      } else {
        this.queue.push(task);
      }
    });
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.queue = [];
    this.pendingById.clear();
  }
}
