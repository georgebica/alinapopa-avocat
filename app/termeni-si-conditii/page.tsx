import type { Metadata } from "next";
import { firm } from "@/content/firm";
import { ServiceHero } from "@/components/ServiceHero";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: `Termenii și condițiile de utilizare a site-ului ${firm.legalName}.`,
  alternates: { canonical: "/termeni-si-conditii" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <ServiceHero
        title="Termeni și condiții"
        crumbs={[{ name: "Termeni și condiții", url: "/termeni-si-conditii" }]}
      />

      <section className="px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 text-sm leading-relaxed text-charcoal-muted">
          <p>
            Prezentul document stabilește termenii și condițiile de utilizare a site-ului
            web al {firm.legalName}. Prin accesarea și utilizarea acestui site, sunteți de
            acord cu termenii de mai jos.
          </p>

          <div>
            <h2 className="font-display text-lg text-ink">1. Informare generală, nu consultanță juridică</h2>
            <p className="mt-3">
              Conținutul acestui site are un caracter informativ general și nu constituie
              consultanță juridică pentru o situație concretă. Informațiile prezentate nu trebuie
              utilizate ca substitut al unei consultații juridice individuale, iar aplicarea lor
              la o situație particulară necesită analiza unui avocat.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">2. Fără raport avocat-client</h2>
            <p className="mt-3">
              Simpla vizitare a acestui site sau transmiterea unui mesaj către datele de contact
              publicate nu are ca efect stabilirea unui raport avocat-client. Un astfel de raport
              se stabilește exclusiv în urma unui acord explicit între cabinet și client, de
              regulă printr-un contract de asistență juridică.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">3. Proprietate intelectuală</h2>
            <p className="mt-3">
              Conținutul acestui site — texte, structură, elemente grafice și vizuale — este
              protejat de legislația privind drepturile de autor și aparține {firm.legalName}
              {" "}
              sau este utilizat cu drepturile aferente. Reproducerea sau utilizarea acestui
              conținut fără acordul prealabil al cabinetului nu este permisă, cu excepția citării
              rezonabile, cu indicarea sursei.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">4. Legături către alte site-uri</h2>
            <p className="mt-3">
              Site-ul poate conține legături către resurse externe (de exemplu, servicii de
              hărți sau mesagerie). Cabinetul nu răspunde de conținutul sau politicile de
              confidențialitate ale site-urilor terțe.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">5. Limitarea răspunderii</h2>
            <p className="mt-3">
              Cabinetul depune diligențe rezonabile pentru ca informațiile publicate pe site să
              fie corecte și actuale, însă nu garantează absența oricăror erori sau omisiuni și nu
              își asumă răspunderea pentru eventualele consecințe ale utilizării informațiilor
              publicate, în absența unei consultații juridice individuale.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink">6. Legea aplicabilă</h2>
            <p className="mt-3">
              Prezentul document este guvernat de legislația română. Orice eventual litigiu
              rezultat din utilizarea acestui site va fi soluționat conform normelor de
              competență prevăzute de legislația română.
            </p>
          </div>

          <p className="text-xs text-charcoal-muted">
            Ultima actualizare: {new Date().getFullYear()}.
          </p>
        </div>
      </section>
    </>
  );
}
