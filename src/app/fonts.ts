import { Big_Shoulders_Stencil, Lato, Geist_Mono } from "next/font/google";

// Stand-in for the licensed "Airstrike" stencil display font. Drop the real
// Airstrike woff2 files into src/fonts/airstrike/ and swap this block for
// next/font/local to use the original typeface:
//
//   import localFont from "next/font/local";
//   export const heading = localFont({
//     src: [{ path: "../fonts/airstrike/Airstrike.woff2", weight: "700" }],
//     variable: "--font-heading",
//     display: "swap",
//   });
export const heading = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-heading",
  display: "swap",
});

// Google's hosted Lato only ships 100/300/400/700/900 (no 600). For the
// exact "Lato Semibold" cut, place the licensed ttf/woff2 under
// src/fonts/lato/ and switch to next/font/local the same way as above.
export const body = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
