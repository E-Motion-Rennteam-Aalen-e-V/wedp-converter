export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function savingsPercent(original: number, result: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - result) / original) * 100);
}

const EXTENSION_MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
};

/**
 * Browsers frequently report an empty `File.type` for formats like BMP
 * (and occasionally GIF) since they aren't consistently registered in the
 * OS MIME database. createImageBitmap needs a real image/* MIME type to
 * pick a decoder, so fall back to guessing it from the file extension.
 */
export function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const match = /\.([a-z0-9]+)$/i.exec(file.name);
  const ext = match?.[1]?.toLowerCase();
  return (ext && EXTENSION_MIME_MAP[ext]) || "application/octet-stream";
}

export function extensionFor(format: "webp" | "png" | "jpeg"): string {
  return format === "jpeg" ? "jpg" : format;
}

export function outputFileName(originalName: string, format: "webp" | "png" | "jpeg"): string {
  const base = originalName.replace(/\.[^/.]+$/, "");
  return `${base}.${extensionFor(format)}`;
}
