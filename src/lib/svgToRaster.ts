// Chromium (and most browsers) cannot decode SVG via createImageBitmap in
// any thread, worker included — it throws "source image could not be
// decoded". The only reliable rasterization path is an HTMLImageElement
// drawn to a canvas, which requires DOM access and therefore must run on
// the main thread before handing the pixels off to the worker pool.
const MAX_RASTER_DIMENSION = 2048;

export async function rasterizeSvgFile(file: File): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = objectUrl;
    await img.decode();

    const intrinsicWidth = img.naturalWidth || 300;
    const intrinsicHeight = img.naturalHeight || 150;
    const scale = Math.min(4, MAX_RASTER_DIMENSION / Math.max(intrinsicWidth, intrinsicHeight));
    const width = Math.max(1, Math.round(intrinsicWidth * Math.max(scale, 1)));
    const height = Math.max(1, Math.round(intrinsicHeight * Math.max(scale, 1)));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas-Kontext konnte nicht erstellt werden.");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("SVG konnte nicht gerastert werden."))),
        "image/png"
      );
    });

    return { buffer: await blob.arrayBuffer(), mimeType: "image/png" };
  } catch {
    throw new Error("SVG ist ungültig oder konnte nicht gerastert werden.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function isSvgFile(file: File): boolean {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}
