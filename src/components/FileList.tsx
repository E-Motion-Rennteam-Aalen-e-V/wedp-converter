"use client";

import { Archive, Trash2 } from "lucide-react";
import type { ImageItem, OutputFormat } from "@/lib/types";
import { FileItem } from "@/components/FileItem";

interface FileListProps {
  items: ImageItem[];
  outputFormat: OutputFormat;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  isZipping: boolean;
}

export function FileList({
  items,
  outputFormat,
  onRemove,
  onRetry,
  onClearAll,
  onDownloadAll,
  isZipping,
}: FileListProps) {
  const doneCount = items.filter((i) => i.status === "done").length;

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg">
          Dateien <span className="font-mono text-sm font-normal normal-case text-muted">({items.length})</span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-red-400/40 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Alle entfernen
          </button>
          <button
            type="button"
            disabled={doneCount === 0 || isZipping}
            onClick={onDownloadAll}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-foreground shadow-[0_0_16px_-4px_var(--color-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Archive className="h-3.5 w-3.5" />
            {isZipping ? "Erstelle ZIP…" : `Alle herunterladen (${doneCount})`}
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <FileItem key={item.id} item={item} outputFormat={outputFormat} onRemove={onRemove} onRetry={onRetry} />
        ))}
      </ul>
    </section>
  );
}
