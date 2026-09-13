import Link from "next/link";

interface FooterProps {
  note?: string;
}

export function Footer({ note }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-border py-6 text-center font-mono text-[11px] font-normal text-muted">
      {note && <p>{note}</p>}
      <nav className={`flex justify-center gap-4 ${note ? "mt-2" : ""}`}>
        <Link href="/kontakt" className="hover:text-accent-text hover:underline">
          Kontakt
        </Link>
        <Link href="/impressum" className="hover:text-accent-text hover:underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:text-accent-text hover:underline">
          Datenschutz
        </Link>
      </nav>
    </footer>
  );
}
