# WEDP Converter

Clientseitiger WebP-Bildkonverter (Next.js 15, App Router, TypeScript, Tailwind v4). Sämtliche Konvertierung läuft im Browser via `OffscreenCanvas` in einem Pool von Web Workern — kein Upload, keine Serverless-Function.

## Features

- Drag-and-Drop-Batch-Upload: PNG, JPG, GIF, BMP, SVG, HEIC/HEIF, WEBP
- Export nach WebP, PNG oder JPG
- Qualitäts-Slider (1–100 %) und optionales Resizing (Seitenverhältnis beibehaltbar)
- Live-Liste mit Thumbnail, Original-/Zielgröße, Ersparnis-%, Status
- Einzel-Download oder ZIP-Sammel-Download (JSZip)

## Entwicklung

```bash
npm install
npm run dev
```

## Deployment

Vercel: Standard-Next.js-Erkennung, keine weitere Konfiguration nötig.

Netlify: `netlify.toml` ist enthalten (`@netlify/plugin-nextjs`, Cache-Header für `_next/static` und `fonts`). `@netlify/plugin-nextjs` wird beim ersten Deploy automatisch installiert.

## Schriften

- **Body**: echte **Lato Semibold** (Gewicht 600), lokal über `next/font/local` eingebunden (`src/fonts/lato/Lato-SemiBold.ttf` + Italic). Google Fonts hostet Lato nur in den Schnitten 100/300/400/700/900 — Semibold ist Teil der originalen, unter SIL Open Font License 1.1 freien Lato-Familie (siehe `src/fonts/lato/OFL.txt`) und wird deshalb als Static-Datei mitgeliefert.
- **Headings**: **Big Shoulders Stencil** (Google Font) als dauerhafter, frei lizenzierter Ersatz für die kommerzielle "Airstrike"-Schrift. "Airstrike" selbst wird bewusst nicht eingebunden, da die Lizenzbedingungen eine Redistribution im Repo nicht zweifelsfrei erlauben.
- **Mono**: Geist Mono via `next/font/google`.
