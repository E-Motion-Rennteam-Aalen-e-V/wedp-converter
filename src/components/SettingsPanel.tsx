"use client";

import { Gauge, Ratio, SlidersHorizontal } from "lucide-react";
import type { ConversionSettings, OutputFormat } from "@/lib/types";

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (partial: Partial<ConversionSettings>) => void;
}

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
];

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const { resize } = settings;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-accent-text" />
        <h2 className="text-base sm:text-lg">Einstellungen</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
            Ausgabeformat
          </label>
          <div className="flex gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onChange({ outputFormat: f.value })}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  settings.outputFormat === f.value
                    ? "border-accent bg-accent text-foreground shadow-[0_0_16px_-4px_var(--color-accent)]"
                    : "border-border bg-background text-muted hover:border-accent-2 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="quality"
            className="mb-2 flex items-center gap-1.5 font-mono text-xs font-normal uppercase tracking-wide text-muted"
          >
            <Gauge className="h-3.5 w-3.5" />
            Qualität
            <span className="ml-auto text-accent-text">{settings.quality}%</span>
          </label>
          <input
            id="quality"
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            disabled={settings.outputFormat === "png"}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-accent-2 accent-accent disabled:cursor-not-allowed disabled:opacity-40"
          />
          {settings.outputFormat === "png" && (
            <p className="mt-1 font-mono text-[11px] font-normal text-muted">
              PNG ist verlustfrei — Qualität wird ignoriert.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={resize.enabled}
            onChange={(e) => onChange({ resize: { ...resize, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span className="flex items-center gap-1.5 font-mono text-xs font-normal uppercase tracking-wide text-muted">
            <Ratio className="h-3.5 w-3.5" />
            Größe ändern
          </span>
        </label>

        {resize.enabled && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-sm">
            <div>
              <label htmlFor="width" className="mb-1 block font-mono text-[11px] font-normal text-muted">
                Breite (px)
              </label>
              <input
                id="width"
                type="number"
                min={1}
                placeholder="Auto"
                value={resize.width ?? ""}
                onChange={(e) =>
                  onChange({
                    resize: { ...resize, width: e.target.value ? Number(e.target.value) : null },
                  })
                }
                className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label htmlFor="height" className="mb-1 block font-mono text-[11px] font-normal text-muted">
                Höhe (px)
              </label>
              <input
                id="height"
                type="number"
                min={1}
                placeholder="Auto"
                value={resize.height ?? ""}
                onChange={(e) =>
                  onChange({
                    resize: { ...resize, height: e.target.value ? Number(e.target.value) : null },
                  })
                }
                className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
            <label className="col-span-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={resize.maintainAspect}
                onChange={(e) => onChange({ resize: { ...resize, maintainAspect: e.target.checked } })}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span className="font-mono text-[11px] font-normal text-muted">Seitenverhältnis beibehalten</span>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
