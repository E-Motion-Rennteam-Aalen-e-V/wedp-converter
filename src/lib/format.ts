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

export function extensionFor(format: "webp" | "png" | "jpeg"): string {
  return format === "jpeg" ? "jpg" : format;
}

export function outputFileName(originalName: string, format: "webp" | "png" | "jpeg"): string {
  const base = originalName.replace(/\.[^/.]+$/, "");
  return `${base}.${extensionFor(format)}`;
}
