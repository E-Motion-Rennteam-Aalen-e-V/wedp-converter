import type { Metadata } from "next";
import { heading, body, mono } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEDP Converter — WebP Image Converter",
  description:
    "Blitzschnelle, clientseitige Konvertierung von PNG/JPG/GIF/BMP/SVG/HEIC nach WebP und zurück. Läuft vollständig im Browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
