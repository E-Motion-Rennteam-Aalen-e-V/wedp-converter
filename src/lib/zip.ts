import JSZip from "jszip";
import type { ImageItem } from "@/lib/types";
import { outputFileName } from "@/lib/format";
import type { OutputFormat } from "@/lib/types";

export async function buildZip(items: ImageItem[], outputFormat: OutputFormat): Promise<Blob> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of items) {
    if (item.status !== "done" || !item.resultBlob) continue;
    let name = outputFileName(item.file.name, outputFormat);
    let suffix = 1;
    while (usedNames.has(name)) {
      name = outputFileName(`${item.file.name.replace(/\.[^/.]+$/, "")}-${suffix}`, outputFormat);
      suffix++;
    }
    usedNames.add(name);
    zip.file(name, item.resultBlob);
  }

  return zip.generateAsync({ type: "blob", compression: "STORE" });
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
