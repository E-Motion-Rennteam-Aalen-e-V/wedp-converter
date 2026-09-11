import type { WorkerRequest, WorkerResponse } from "@/lib/types";

type PendingTask = {
  request: WorkerRequest;
  resolve: (res: WorkerResponse) => void;
};

const MAX_RESPAWNS_PER_SLOT = 3;

/**
 * Round-robin pool of dedicated Web Workers that perform the actual
 * image decode/resize/encode work off the main thread.
 */
export class ConversionWorkerPool {
  private workers: Worker[] = [];
  private busy: boolean[] = [];
  private retired: boolean[] = [];
  private currentTaskId: (string | undefined)[] = [];
  private respawnCount: number[] = [];
  private queue: PendingTask[] = [];
  private pendingById = new Map<string, PendingTask>();
  private destroyed = false;

  constructor(private readonly size = Math.min(navigator.hardwareConcurrency || 4, 6)) {
    for (let i = 0; i < size; i++) {
      this.spawnWorker(i);
      this.busy.push(false);
      this.retired.push(false);
      this.currentTaskId.push(undefined);
      this.respawnCount.push(0);
    }
  }

  private spawnWorker(index: number) {
    // The `new Worker(new URL(...), import.meta.url)` call must appear
    // literally inline here — Next.js/webpack statically detects this exact
    // syntactic pattern to bundle convert.worker.ts as its own chunk.
    // Routing it through a helper function breaks that detection: the
    // Worker then fails to load correctly and every conversion errors out.
    const worker = new Worker(new URL("../workers/convert.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.onWorkerMessage(index, event.data);
    worker.onerror = (event: ErrorEvent) => this.onWorkerError(index, event);
    this.workers[index] = worker;
  }

  private onWorkerMessage(workerIndex: number, response: WorkerResponse) {
    this.settleWorker(workerIndex, response);
  }

  private onWorkerError(workerIndex: number, event: ErrorEvent) {
    // A worker that throws uncaught (e.g. an out-of-memory decode) may be
    // left in an unrecoverable state — replace it so the pool doesn't
    // permanently lose a slot, and never leave the in-flight task hanging.
    event.preventDefault();
    const taskId = this.currentTaskId[workerIndex];
    this.currentTaskId[workerIndex] = undefined;
    this.workers[workerIndex]?.terminate();

    // Guard against a respawn loop (e.g. a systemic failure where every
    // fresh worker immediately errors again): give up on this slot after a
    // few attempts instead of spinning indefinitely.
    const respawns = (this.respawnCount[workerIndex] ?? 0) + 1;
    this.respawnCount[workerIndex] = respawns;
    if (respawns <= MAX_RESPAWNS_PER_SLOT) {
      this.spawnWorker(workerIndex);
      this.busy[workerIndex] = false;
    } else {
      this.retired[workerIndex] = true;
    }

    if (taskId) {
      const task = this.pendingById.get(taskId);
      if (task) {
        this.pendingById.delete(taskId);
        task.resolve({
          id: taskId,
          ok: false,
          error: event.message || "Der Konvertierungs-Worker ist unerwartet abgestürzt.",
        });
      }
    }

    if (!this.retired[workerIndex]) {
      this.dispatchNext(workerIndex);
    } else if (this.workers.every((_, i) => this.retired[i])) {
      // Every slot gave up — fail whatever is left queued instead of
      // leaving those uploads stuck on "processing" forever.
      this.failAllQueued("Alle Konvertierungs-Worker sind abgestürzt.");
    }
  }

  private failAllQueued(message: string) {
    const stuck = this.queue.splice(0, this.queue.length);
    stuck.forEach((task) => task.resolve({ id: task.request.id, ok: false, error: message }));
  }

  private settleWorker(workerIndex: number, response: WorkerResponse) {
    this.busy[workerIndex] = false;
    this.currentTaskId[workerIndex] = undefined;
    const task = this.pendingById.get(response.id);
    if (task) {
      this.pendingById.delete(response.id);
      task.resolve(response);
    }
    this.dispatchNext(workerIndex);
  }

  private dispatchNext(workerIndex: number) {
    if (this.retired[workerIndex]) return;
    const task = this.queue.shift();
    const worker = this.workers[workerIndex];
    if (!task || !worker) return;
    this.busy[workerIndex] = true;
    this.currentTaskId[workerIndex] = task.request.id;
    this.pendingById.set(task.request.id, task);
    worker.postMessage(task.request, [task.request.buffer]);
  }

  private findFreeWorker(): number {
    return this.busy.findIndex((b, i) => !b && !this.retired[i]);
  }

  submit(request: WorkerRequest): Promise<WorkerResponse> {
    return new Promise((resolve) => {
      if (this.destroyed) {
        resolve({ id: request.id, ok: false, error: "Konvertierungs-Pool wurde bereits beendet." });
        return;
      }
      const task: PendingTask = { request, resolve };
      const freeIndex = this.findFreeWorker();
      const freeWorker = freeIndex !== -1 ? this.workers[freeIndex] : undefined;
      if (freeIndex !== -1 && freeWorker) {
        this.busy[freeIndex] = true;
        this.currentTaskId[freeIndex] = request.id;
        this.pendingById.set(request.id, task);
        freeWorker.postMessage(request, [request.buffer]);
      } else {
        this.queue.push(task);
      }
    });
  }

  destroy() {
    this.destroyed = true;
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.queue = [];
    this.pendingById.clear();
  }
}
