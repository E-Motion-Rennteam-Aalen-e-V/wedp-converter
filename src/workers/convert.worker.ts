/// <reference lib="webworker" />

// Runs entirely in a dedicated Web Worker — no serverless dependency.
// Decodes raster images (PNG/JPG/GIF/BMP/WEBP) via createImageBitmap and
// re-encodes through OffscreenCanvas. SVG and HEIC/HEIF are pre-converted
// to a raster buffer on the main thread before reaching this worker,
// since neither createImageBitmap(svg) nor heic2any work off-main-thread
// (see src/lib/svgToRaster.ts and src/lib/heicToRaster.ts).

import type { WorkerRequest, WorkerResponse, ResizeSettings } from "@/lib/types";

const workerCtx = self as unknown as DedicatedWorkerGlobalScope;

function mimeForOutput(format: "webp" | "png" | "jpeg"): string {
  if (format === "png") return "image/png";
  if (format === "jpeg") return "image/jpeg";
  return "image/webp";
}

function computeTargetSize(
  sourceWidth: number,
  sourceHeight: number,
  resize: ResizeSettings
): { width: number; height: number } {
  if (!resize.enabled || (!resize.width && !resize.height)) {
    return { width: sourceWidth, height: sourceHeight };
  }
  const aspect = sourceWidth / sourceHeight;

  if (resize.maintainAspect) {
    if (resize.width && !resize.height) {
      return { width: resize.width, height: Math.round(resize.width / aspect) };
    }
    if (resize.height && !resize.width) {
      return { width: Math.round(resize.height * aspect), height: resize.height };
    }
    if (resize.width && resize.height) {
      // Fit within the box while preserving aspect ratio.
      const scale = Math.min(resize.width / sourceWidth, resize.height / sourceHeight);
      return {
        width: Math.max(1, Math.round(sourceWidth * scale)),
        height: Math.max(1, Math.round(sourceHeight * scale)),
      };
    }
  }

  return {
    width: resize.width ?? sourceWidth,
    height: resize.height ?? sourceHeight,
  };
}

async function decodeToBitmap(buffer: ArrayBuffer, mimeType: string): Promise<ImageBitmap> {
  const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
  try {
    return await createImageBitmap(blob);
  } catch {
    throw new Error("Datei ist beschädigt oder Format wird nicht unterstützt.");
  }
}

async function handleConversion(req: WorkerRequest): Promise<WorkerResponse> {
  try {
    const bitmap = await decodeToBitmap(req.buffer, req.mimeType);
    const { width, height } = computeTargetSize(
      bitmap.width,
      bitmap.height,
      req.resize
    );

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas-Kontext konnte nicht erstellt werden.");

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outMime = mimeForOutput(req.outputFormat);
    const blob = await canvas.convertToBlob({
      type: outMime,
      quality: outMime === "image/png" ? undefined : req.quality / 100,
    });

    return { id: req.id, ok: true, blob, width, height };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Konvertierungsfehler.";
    return { id: req.id, ok: false, error: message };
  }
}

workerCtx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const response = await handleConversion(event.data);
  workerCtx.postMessage(response);
};
