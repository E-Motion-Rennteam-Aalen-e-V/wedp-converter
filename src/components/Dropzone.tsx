"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { ACCEPTED_EXTENSIONS } from "@/lib/types";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((file) => {
        const lower = file.name.toLowerCase();
        return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      });
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
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
        handleFiles(e.dataTransfer.files);
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
      <UploadCloud
        className={`mx-auto h-12 w-12 transition-transform ${isDragActive ? "scale-110 text-accent-text" : "text-accent-text"}`}
        strokeWidth={1.5}
      />
      <p className="mt-4 text-base font-normal text-foreground sm:text-lg">
        Bilder hierher ziehen oder <span className="text-accent-text underline">durchsuchen</span>
      </p>
      <p className="mt-2 font-mono text-xs font-normal text-muted">
        PNG · JPG · GIF · BMP · SVG · HEIC · WEBP — mehrere Dateien möglich
      </p>
    </div>
  );
}
