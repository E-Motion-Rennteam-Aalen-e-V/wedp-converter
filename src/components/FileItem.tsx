"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ImageOff, Loader2, RotateCw, X } from "lucide-react";
import type { ImageItem, OutputFormat } from "@/lib/types";
import { formatBytes, outputFileName, savingsPercent } from "@/lib/format";
import { triggerDownload } from "@/lib/zip";
import { isHeicFile } from "@/lib/heicToRaster";

interface FileItemProps {
  item: ImageItem;
  outputFormat: OutputFormat;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function FileItem({ item, outputFormat, onRemove, onRetry }: FileItemProps) {
  const savings =
    item.status === "done" && item.resultSize !== undefined
      ? savingsPercent(item.originalSize, item.resultSize)
      : null;

  // Prefer showing the converted result once available — it reflects the
  // actual output (incl. resize) and is always a browser-renderable format.
  // Browsers cannot natively decode HEIC in <img>, so its raw previewUrl
  // would otherwise render as a broken image until conversion finishes.
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!item.resultBlob) {
      setResultPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(item.resultBlob);
    setResultPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.resultBlob]);

  const canShowOriginalPreview = !isHeicFile(item.file);
  const thumbnailSrc = resultPreviewUrl ?? (canShowOriginalPreview ? item.previewUrl : null);

  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 sm:p-4">
      {thumbnailSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob: preview URL, not an optimizable remote asset
        <img
          src={thumbnailSrc}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted">
          <ImageOff className="h-5 w-5" aria-hidden="true" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.file.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] font-normal text-muted">
          <span>{formatBytes(item.originalSize)}</span>
          {item.status === "done" && item.resultSize !== undefined && (
            <>
              <span>→</span>
              <span className="text-accent-text">{formatBytes(item.resultSize)}</span>
              {savings !== null && (
                <span className={savings >= 0 ? "text-emerald-400" : "text-orange-400"}>
                  ({savings >= 0 ? "-" : "+"}
                  {Math.abs(savings)}%)
                </span>
              )}
            </>
          )}
          {item.status === "error" && <span className="text-red-400">{item.error}</span>}
        </div>

        {item.status === "processing" && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent-2/40">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-accent" />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <StatusIcon status={item.status} />

        {item.status === "error" && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            aria-label="Erneut versuchen"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-accent-2/30 hover:text-foreground"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        )}

        {item.status === "done" && item.resultBlob && (
          <button
            type="button"
            onClick={() => triggerDownload(item.resultBlob!, outputFileName(item.file.name, outputFormat))}
            aria-label="Herunterladen"
            className="rounded-lg p-2 text-accent-text transition-colors hover:bg-accent-2/30"
          >
            <Download className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Entfernen"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function StatusIcon({ status }: { status: ImageItem["status"] }) {
  if (status === "processing") return <Loader2 className="h-4 w-4 animate-spin text-accent-text" />;
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "error") return <AlertTriangle className="h-4 w-4 text-red-400" />;
  return null;
}
