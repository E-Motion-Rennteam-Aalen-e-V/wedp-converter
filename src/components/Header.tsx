import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-[0_0_24px_-4px_var(--color-accent)]">
          <Zap className="h-5 w-5 text-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl leading-none sm:text-2xl">WEDP Converter</h1>
          <p className="mt-1 font-mono text-xs font-normal normal-case tracking-wide text-muted">
            100% client-side · WebP ⇄ PNG/JPG
          </p>
        </div>
      </div>
    </header>
  );
}
