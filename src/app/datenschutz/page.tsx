import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — WEDP Converter",
  description:
    "Datenschutzerklärung des WEDP Converter: Informationen zur Verarbeitung personenbezogener Daten in dieser Anwendung.",
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <LegalSection title="1. Verantwortlicher">
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) für die Datenverarbeitung in
          dieser Anwendung ist:
          <br />
          E-Motion Rennteam Aalen e.V.
          <br />
          vertreten durch Linda Mann, 1. Vorstand
          <br />
          Hochschule Aalen, Beethovenstraße 1, 73430 Aalen
          <br />
          E-Mail:{" "}
          <a href="mailto:info@emotion-rennteam.de" className="text-accent-text underline">
            info@emotion-rennteam.de
          </a>
          , Telefon: +49 7361 5762191
          <br />
          Für Fragen zu dieser Anwendung konkret:{" "}
          <a href="mailto:denny.svalina@emotion-rennteam.de" className="text-accent-text underline">
            denny.svalina@emotion-rennteam.de
          </a>{" "}
          (Denny Svalina, Entwicklung und Betrieb)
        </p>
      </LegalSection>

      <LegalSection title="2. Bildkonvertierung: keine Datenübertragung">
        <p>
          Die Kernfunktion dieser Anwendung — die Konvertierung von Bildern zu bzw. aus dem WebP-Format —
          läuft vollständig lokal in deinem Browser (über Web Worker und <code>OffscreenCanvas</code>). Die
          von dir ausgewählten Bilddateien werden zu keinem Zeitpunkt an einen Server übertragen, dort
          verarbeitet oder gespeichert. Wir erhalten keine Kenntnis von Inhalt, Namen oder Metadaten deiner
          Bilder.
        </p>
      </LegalSection>

      <LegalSection title="3. Allgemeines zur Datenverarbeitung">
        <p>
          Im Übrigen verarbeiten wir personenbezogene Daten nur, soweit dies zur Bereitstellung einer
          funktionsfähigen Anwendung erforderlich ist, oder soweit du eingewilligt hast
          (Art. 6 Abs. 1 lit. a DSGVO). Soweit die Verarbeitung zur Erfüllung technischer Erfordernisse
          notwendig ist, stützen wir uns auf unser berechtigtes Interesse an einem sicheren und
          funktionsfähigen Betrieb (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="4. Hosting und Server-Logfiles">
        <p>
          Diese Anwendung wird bei einem externen Hosting-Anbieter (Vercel bzw. Netlify) betrieben. Beim
          Aufruf werden durch den auf deinem Endgerät zum Einsatz kommenden Browser automatisch
          Informationen an den Server des Hosters übertragen (Server-Logfiles), z. B. IP-Adresse, Datum und
          Uhrzeit des Zugriffs, aufgerufene Seite sowie Browsertyp und -version. Diese Daten sind zur
          technischen Auslieferung der Anwendung und zur Abwehr von Missbrauch erforderlich
          (Art. 6 Abs. 1 lit. f DSGVO) und werden nach den jeweiligen Aufbewahrungsfristen des Hosters
          automatisch gelöscht. Mit dem Hoster besteht, soweit erforderlich, ein Vertrag zur
          Auftragsverarbeitung gemäß Art. 28 DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies im Admin-Bereich">
        <p>
          Für Besucher, die nur die Konvertierungsfunktion nutzen, setzt diese Anwendung keine Cookies.
          Ausschließlich im internen, zugangsbeschränkten Admin-Bereich (<code>/admin</code>) wird nach
          erfolgreicher Anmeldung ein technisch notwendiges Cookie (
          <code className="rounded bg-background px-1 py-0.5 border border-border">admin_session</code>)
          gesetzt, das die angemeldete Sitzung signiert enthält. Es ist <code>httpOnly</code> (kein
          JavaScript-Zugriff möglich), auf <code>SameSite=Strict</code> beschränkt und läuft spätestens
          nach 8 Stunden automatisch ab. Da dieses Cookie zur Bereitstellung des Login-Funktion zwingend
          erforderlich ist, ist hierfür keine Einwilligung nach § 25 Abs. 2 Nr. 2 TTDSG erforderlich
          (Art. 6 Abs. 1 lit. f DSGVO). Analyse-, Marketing- oder Tracking-Cookies sowie entsprechende
          Dienste Dritter setzen wir nicht ein.
        </p>
      </LegalSection>

      <LegalSection title="6. Anmeldedaten im Admin-Bereich">
        <p>
          Zur Absicherung des internen Admin-Bereichs verarbeiten wir beim Login-Versuch den eingegebenen
          Benutzernamen sowie die IP-Adresse (zur Erkennung übermäßig vieler Anmeldeversuche, maximal 5 pro
          5 Minuten). Diese Rate-Begrenzung wird ausschließlich im Arbeitsspeicher des Servers gehalten,
          nicht dauerhaft gespeichert und verfällt automatisch nach wenigen Minuten
          (Art. 6 Abs. 1 lit. f DSGVO, Schutz vor Brute-Force-Angriffen). Zugangsdaten lokal verwalteter
          Admin-Konten werden ausschließlich als Passwort-Hash (scrypt, mit individuellem Salt) gespeichert,
          niemals im Klartext. Dieser Bereich ist ausschließlich für autorisierte Teammitglieder bestimmt
          und nicht öffentlich zugänglich.
        </p>
      </LegalSection>

      <LegalSection title="7. Schriftarten">
        <p>
          Diese Anwendung nutzt zur einheitlichen Darstellung von Schriftarten die Dienste „Google Fonts“
          sowie eine lokal eingebettete Schriftdatei. Alle verwendeten Schriftdateien werden bereits beim
          Bauen der Anwendung heruntergeladen bzw. sind fest im Quellcode enthalten und werden vom eigenen
          Server ausgeliefert. Bei deinem Besuch findet daher keine Verbindung zu Servern von Google statt
          und es werden keine Daten an Google übertragen.
        </p>
      </LegalSection>

      <LegalSection title="8. SSL-/TLS-Verschlüsselung">
        <p>
          Diese Anwendung nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung zur Übertragung
          vertraulicher Inhalte, etwa der Anmeldedaten im Admin-Bereich. Eine verschlüsselte Verbindung
          erkennst du daran, dass die Adresszeile deines Browsers von „http://“ auf „https://“ wechselt und
          an dem Schloss-Symbol in deiner Browserzeile.
        </p>
      </LegalSection>

      <LegalSection title="9. Deine Rechte">
        <p>
          Du hast jederzeit das Recht auf Auskunft über deine bei uns gespeicherten personenbezogenen Daten,
          deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung (Art. 15 DSGVO). Ebenso steht
          dir ein Recht auf Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der
          Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie ein Widerspruchsrecht
          gegen die Verarbeitung deiner Daten (Art. 21 DSGVO) zu. Hast du uns eine Einwilligung erteilt,
          kannst du diese jederzeit mit Wirkung für die Zukunft widerrufen, ohne dass die Rechtmäßigkeit der
          bis zum Widerruf erfolgten Verarbeitung berührt wird. Wende dich hierzu an die oben genannte
          Kontaktadresse.
        </p>
      </LegalSection>

      <LegalSection title="10. Beschwerderecht bei der Aufsichtsbehörde">
        <p>
          Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs steht dir
          ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu, insbesondere in dem Mitgliedstaat
          deines gewöhnlichen Aufenthaltsorts. Für uns zuständig ist:
          <br />
          Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI)
          <br />
          Königstraße 10a, 70173 Stuttgart
        </p>
      </LegalSection>

      <LegalSection title="11. Änderung dieser Datenschutzerklärung">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
          rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für deinen
          erneuten Besuch gilt dann die neue Datenschutzerklärung.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
