import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Converter
        </Link>
        <h1 className="mt-6 text-3xl sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
