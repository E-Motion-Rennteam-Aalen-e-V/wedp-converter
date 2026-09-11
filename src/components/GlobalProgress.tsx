interface GlobalProgressProps {
  progress: number;
  total: number;
}

export function GlobalProgress({ progress, total }: GlobalProgressProps) {
  if (total === 0) return null;

  return (
    <div className="mt-6" aria-live="polite">
      <div className="mb-1.5 flex items-center justify-between font-mono text-xs font-normal text-muted">
        <span>Gesamtfortschritt</span>
        <span className="text-accent-text">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-accent-2/30">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
