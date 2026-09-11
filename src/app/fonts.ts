import localFont from "next/font/local";
import { Big_Shoulders_Stencil, Geist_Mono } from "next/font/google";

// Racing/stencil heading look. Freely licensed Google Font, used in place of
// the commercially licensed "Airstrike" typeface (kept permanently — see
// README for the licensing rationale).
export const heading = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-heading",
  display: "swap",
});

// Real Lato Semibold (weight 600), the exact cut requested. Google Fonts
// only serves 100/300/400/700/900 through its API, so this ships the
// original SIL OFL-licensed static files locally instead — see
// src/fonts/lato/OFL.txt.
export const body = localFont({
  src: [
    { path: "../fonts/lato/Lato-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/lato/Lato-SemiBoldItalic.ttf", weight: "600", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
