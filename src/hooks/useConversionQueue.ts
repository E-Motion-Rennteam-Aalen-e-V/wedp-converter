"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConversionWorkerPool } from "@/lib/workerPool";
import { isSvgFile, rasterizeSvgFile } from "@/lib/svgToRaster";
import { isHeicFile, convertHeicFile } from "@/lib/heicToRaster";
import { resolveMimeType } from "@/lib/format";
import type { ConversionSettings, ImageItem, WorkerRequest } from "@/lib/types";

const SETTINGS_CHANGE_DEBOUNCE_MS = 400;

const DEFAULT_SETTINGS: ConversionSettings = {
  outputFormat: "webp",
  quality: 80,
  resize: { enabled: false, width: null, height: null, maintainAspect: true },
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useConversionQueue() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const poolRef = useRef<ConversionWorkerPool | null>(null);

  useEffect(() => {
    poolRef.current = new ConversionWorkerPool();
    return () => {
      poolRef.current?.destroy();
      poolRef.current = null;
    };
  }, []);

  const processItem = useCallback(
    async (item: ImageItem, activeSettings: ConversionSettings) => {
      const pool = poolRef.current;
      if (!pool) return;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "processing", error: undefined } : i))
      );

      try {
        const { buffer, mimeType } = isSvgFile(item.file)
          ? await rasterizeSvgFile(item.file)
          : isHeicFile(item.file)
            ? await convertHeicFile(item.file)
            : { buffer: await item.file.arrayBuffer(), mimeType: resolveMimeType(item.file) };

        const request: WorkerRequest = {
          id: item.id,
          buffer,
          mimeType,
          fileName: item.file.name,
          outputFormat: activeSettings.outputFormat,
          quality: activeSettings.quality,
          resize: activeSettings.resize,
        };
        const response = await pool.submit(request);

        if (response.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: "done",
                    resultBlob: response.blob,
                    resultSize: response.blob.size,
                    resultWidth: response.width,
                    resultHeight: response.height,
                  }
                : i
            )
          );
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: response.error } : i))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Datei konnte nicht gelesen werden.";
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: message } : i)));
      }
    },
    []
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: ImageItem[] = files.map((file) => ({
        id: makeId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
        originalSize: file.size,
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => {
        void processItem(item, settings);
      });
    },
    [processItem, settings]
  );

  const retryItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) void processItem(item, settings);
    },
    [items, processItem, settings]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return [];
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<ConversionSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const reconvertAll = useCallback(() => {
    items.forEach((item) => void processItem(item, settings));
  }, [items, processItem, settings]);

  // Re-run the conversion for already-uploaded images whenever the output
  // format, quality, or resize settings change, so the file list always
  // reflects the currently selected settings — not just newly added files.
  // Debounced so dragging the quality slider doesn't spawn a worker job per tick.
  const isFirstSettingsRender = useRef(true);
  useEffect(() => {
    if (isFirstSettingsRender.current) {
      isFirstSettingsRender.current = false;
      return;
    }
    if (items.length === 0) return;
    const timeout = setTimeout(() => {
      items.forEach((item) => void processItem(item, settings));
    }, SETTINGS_CHANGE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // Intentionally excludes `items`/`processItem`: only a settings change
    // should trigger a batch re-convert, not every list mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const overallProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const finished = items.filter((i) => i.status === "done" || i.status === "error").length;
    return Math.round((finished / items.length) * 100);
  }, [items]);

  return {
    items,
    settings,
    updateSettings,
    addFiles,
    removeItem,
    retryItem,
    clearAll,
    reconvertAll,
    overallProgress,
  };
}
