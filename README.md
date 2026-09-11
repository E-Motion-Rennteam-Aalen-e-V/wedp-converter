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

`src/app/fonts.ts` verwendet aktuell Google-Font-Ersatztypen (Big Shoulders Stencil Text / Lato) als Platzhalter für die lizenzierten Fonts "Airstrike" und "Lato Semibold", da deren Dateien nicht im Repo enthalten sein dürfen. Lizenzierte Font-Dateien unter `src/fonts/` ablegen und gemäß Kommentaren in `fonts.ts` auf `next/font/local` umstellen.
