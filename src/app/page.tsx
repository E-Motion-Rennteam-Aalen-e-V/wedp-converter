"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dropzone } from "@/components/Dropzone";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FileList } from "@/components/FileList";
import { GlobalProgress } from "@/components/GlobalProgress";
import { useConversionQueue } from "@/hooks/useConversionQueue";
import { buildZip, triggerDownload } from "@/lib/zip";

export default function Home() {
  const { items, settings, updateSettings, addFiles, removeItem, retryItem, clearAll, overallProgress } =
    useConversionQueue();
  const [isZipping, setIsZipping] = useState(false);

  async function handleDownloadAll() {
    setIsZipping(true);
    try {
      const blob = await buildZip(items, settings.outputFormat);
      triggerDownload(blob, `wedp-converter-export.zip`);
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Dropzone onFiles={addFiles} />
        <GlobalProgress progress={overallProgress} total={items.length} />

        <div className="mt-8">
          <SettingsPanel settings={settings} onChange={updateSettings} />
        </div>

        <FileList
          items={items}
          outputFormat={settings.outputFormat}
          onRemove={removeItem}
          onRetry={retryItem}
          onClearAll={clearAll}
          onDownloadAll={handleDownloadAll}
          isZipping={isZipping}
        />
      </main>
      <Footer note="Alle Konvertierungen laufen lokal im Browser — es werden keine Bilder hochgeladen." />
    </div>
  );
}
