import type { Metadata } from "next";
import { firm } from "@/content/firm";
import { ServiceHero } from "@/components/ServiceHero";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: `Politica de confidențialitate a ${firm.legalName} privind prelucrarea datelor cu caracter personal.`,
  alternates: { canonical: "/politica-de-confidentialitate" },
  robots: { index: false, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <ServiceHero
        title="Politica de confidențialitate"
        crumbs={[{ name: "Politica de confidențialitate", url: "/politica-de-confidentialitate" }]}
      />

      <section className="px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 text-sm leading-relaxed text-charcoal-muted">
          <p>
            {firm.legalName} ({firm.address.street}, {firm.address.city}, {firm.address.postalCode},
            {" "}
            {firm.address.country}) acordă o importanță deosebită protecției datelor cu caracter
            personal ale vizitatorilor și clienților săi și prelucrează aceste date în conformitate
            cu Regulamentul (UE) 2016/679 privind protecția persoanelor fizice în ceea ce privește
            prelucrarea datelor cu caracter personal (&bdquo;GDPR&rdquo;) și cu legislația națională
            aplicabilă.
          </p>

          <div>
            <h2 className="font-display text-lg text-ink">1. Operatorul de date</h2>
            <p className="mt-3">
              Operatorul datelor cu caracter personal colectate prin intermediul acestui site este
              {" "}
              {firm.legalName}, cu sediul profesional în {firm.address.street},
              {" "}
              {firm.address.city}, {firm.address.postalCode}, membru al {firm.barGenitive}. Pentru orice
              întrebare privind prelucrarea datelor cu caracter personal, ne puteți contacta la
              adresa de email {firm.email} sau la numărul de telefon {firm.phoneDisplay}.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">2. Ce date colectăm</h2>
            <p className="mt-3">
              Acest site nu conține formulare și nu colectează date cu caracter personal în mod
              automat. Contactul se realizează exclusiv prin canalele indicate de dumneavoastră —
              telefon, WhatsApp sau email —, iar datele pe care ni le transmiteți pe aceste căi
              sunt cele pe care alegeți să le comunicați: nume, date de contact și descrierea
              situației juridice. Vă recomandăm să nu includeți în primul mesaj mai multe
              informații decât este necesar pentru o evaluare preliminară.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">3. Scopul prelucrării</h2>
            <p className="mt-3">
              Datele transmise de dumneavoastră sunt utilizate exclusiv pentru a răspunde
              solicitării și pentru a stabili o eventuală relație de asistență juridică, în
              temeiul interesului legitim al cabinetului de a comunica cu potențialii clienți și,
              ulterior, în temeiul executării unui eventual contract de asistență juridică.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">4. Durata păstrării datelor</h2>
            <p className="mt-3">
              Comunicările primite sunt păstrate pe perioada necesară soluționării solicitării
              dumneavoastră, iar, în cazul în care se stabilește o relație de asistență juridică,
              pe durata prevăzută de normele profesiei de avocat privind păstrarea documentelor
              legate de o cauză.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">5. Confidențialitate</h2>
            <p className="mt-3">{firm.confidentialityStatement}</p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">6. Drepturile dumneavoastră</h2>
            <p className="mt-3">
              În conformitate cu GDPR, aveți dreptul de acces la datele dumneavoastră, dreptul la
              rectificare, dreptul la ștergere, dreptul la restricționarea prelucrării, dreptul la
              portabilitatea datelor, dreptul la opoziție, precum și dreptul de a depune o
              plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
              Personal (ANSPDCP). Pentru exercitarea acestor drepturi, ne puteți contacta la datele
              de contact indicate mai sus.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">7. Cookie-uri</h2>
            <p className="mt-3">
              Acest site utilizează exclusiv cookie-uri strict necesare funcționării tehnice a
              paginii. Nu utilizăm cookie-uri de urmărire sau de publicitate ale unor terți. Dacă
              această politică se modifică, vom actualiza această secțiune în consecință.
            </p>
          </div>

          <p className="text-xs text-charcoal-muted">
            Această politică poate fi actualizată periodic. Ultima actualizare: {new Date().getFullYear()}.
          </p>
        </div>
      </section>
    </>
  );
}
