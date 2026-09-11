// heic2any reaches for the `window` global internally, which does not
// exist inside a dedicated Worker (only `self` does) — it throws
// "window is not defined" there. So HEIC/HEIF decoding, like SVG
// rasterization, has to run on the main thread before handing the
// resulting JPEG buffer off to the worker pool for resize/encode.
export async function convertHeicFile(file: File): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!blob) throw new Error("HEIC-Konvertierung lieferte kein Ergebnis.");
    return { buffer: await blob.arrayBuffer(), mimeType: "image/jpeg" };
  } catch {
    throw new Error("HEIC-Datei ist beschädigt oder konnte nicht dekodiert werden.");
  }
}

export function isHeicFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    lower.endsWith(".heic") ||
    lower.endsWith(".heif")
  );
}
