"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FolderUp, UploadCloud } from "lucide-react";
import { ACCEPTED_EXTENSIONS } from "@/lib/types";
import { filesFromDataTransferItems } from "@/lib/folderEntries";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [rejectedNotice, setRejectedNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (!rejectedNotice) return;
    const timeout = setTimeout(() => setRejectedNotice(null), 5000);
    return () => clearTimeout(timeout);
  }, [rejectedNotice]);

  const filterAndDispatch = useCallback(
    (all: File[]) => {
      const files = all.filter((file) => {
        const lower = file.name.toLowerCase();
        return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      });

      const rejectedCount = all.length - files.length;
      setRejectedNotice(
        rejectedCount > 0
          ? `${rejectedCount} Datei${rejectedCount > 1 ? "en" : ""} übersprungen (nicht unterstütztes Format).`
          : null
      );

      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      filterAndDispatch(Array.from(fileList));
    },
    [filterAndDispatch]
  );

  const handleDrop = useCallback(
    async (dataTransfer: DataTransfer) => {
      const traversed = await filesFromDataTransferItems(dataTransfer.items);
      filterAndDispatch(traversed ?? Array.from(dataTransfer.files));
    },
    [filterAndDispatch]
  );

  return (
    <div
      className={`glow-focus rounded-xl border-2 border-dashed bg-surface p-10 text-center transition-colors sm:p-16 ${
        isDragActive ? "border-accent-text bg-accent-2/10" : "border-border"
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current <= 0) setIsDragActive(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragActive(false);
        void handleDrop(e.dataTransfer);
      }}
      role="button"
      tabIndex={0}
      aria-label="Bilder hochladen: klicken oder per Drag-and-Drop ablegen"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error non-standard but supported attribute for folder selection
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <UploadCloud
        className={`mx-auto h-12 w-12 transition-transform ${isDragActive ? "scale-110 text-accent-text" : "text-accent-text"}`}
        strokeWidth={1.5}
      />
      <p className="mt-4 text-base font-normal text-foreground sm:text-lg">
        Bilder hierher ziehen oder <span className="text-accent-text underline">durchsuchen</span>
      </p>
      <p className="mt-2 font-mono text-xs font-normal text-muted">
        PNG · JPG · GIF · BMP · SVG · HEIC · WEBP — mehrere Dateien möglich, auch ganze Ordner
      </p>
      <button
        type="button"
        className="glow-focus relative z-10 mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 font-mono text-xs font-normal text-foreground transition-colors hover:border-accent-text hover:text-accent-text"
        onClick={(e) => {
          e.stopPropagation();
          folderInputRef.current?.click();
        }}
      >
        <FolderUp className="h-4 w-4" strokeWidth={1.5} />
        Ordner auswählen
      </button>
      {rejectedNotice && (
        <p className="mt-3 font-mono text-xs font-normal text-orange-400" role="status">
          {rejectedNotice}
        </p>
      )}
    </div>
  );
}
