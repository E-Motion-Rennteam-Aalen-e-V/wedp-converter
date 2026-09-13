import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Impressum — WEDP Converter",
  description: "Impressum und Anbieterkennzeichnung des WEDP Converter (E-Motion Rennteam Aalen e.V.) gemäß § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>
          E-Motion Rennteam Aalen e.V.
          <br />
          Hochschule Aalen
          <br />
          Beethovenstraße 1
          <br />
          73430 Aalen
        </p>
      </LegalSection>

      <LegalSection title="Vertreten durch">
        <p>Linda Mann, 1. Vorstand (Vorstand 2026)</p>
      </LegalSection>

      <LegalSection title="Verantwortlich für diese Anwendung">
        <p>
          Entwicklung und Betrieb des WEDP Converter: Denny Svalina
          <br />
          E-Mail:{" "}
          <a href="mailto:denny.svalina@emotion-rennteam.de" className="text-accent-text underline">
            denny.svalina@emotion-rennteam.de
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Telefon: +49 7361 5762191
          <br />
          E-Mail:{" "}
          <a href="mailto:info@emotion-rennteam.de" className="text-accent-text underline">
            info@emotion-rennteam.de
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Registereintrag">
        <p>
          Eintragung im Vereinsregister.
          <br />
          Registergericht: Amtsgericht Ulm
          <br />
          Registernummer: VR 833
        </p>
      </LegalSection>

      <LegalSection title="Umsatzsteuer-ID">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
          <br />
          DE304670383
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>Denny Svalina, Anschrift wie oben</p>
      </LegalSection>

      <LegalSection title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die unter{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-text underline"
          >
            ec.europa.eu/consumers/odr
          </a>{" "}
          erreichbar ist. Unsere E-Mail-Adresse findest du oben. Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Inhalte">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG bzw. § 7 Abs. 1 DDG für eigene Inhalte dieser
          Anwendung nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
          Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Links">
        <p>
          Diese Anwendung kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die
          Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich.
        </p>
      </LegalSection>

      <LegalSection title="Urheberrecht">
        <p>
          Die durch die Betreiber erstellten Inhalte und der Quellcode dieser Anwendung unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
          außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen
          Rechteinhabers.
        </p>
      </LegalSection>

      <LegalSection title="Externe Dienste und Datenschutz">
        <p>
          Die zur Darstellung verwendeten Schriftarten werden bereits beim Bauen dieser Anwendung lokal
          eingebunden; beim Aufruf findet keine Verbindung zu Google-Servern statt. Details zur Verarbeitung
          personenbezogener Daten findest du in unserer{" "}
          <a href="/datenschutz" className="text-accent-text underline">
            Datenschutzerklärung
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
