import type { Metadata } from "next";
import { firm } from "@/content/firm";
import { ServiceHero } from "@/components/ServiceHero";
import { ValueCard } from "@/components/ValueCard";
import { ConfidentialityBlock } from "@/components/ConfidentialityBlock";
import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Despre noi",
  description: `Istoricul Cabinetului de Avocat Alina Popa, fondat în ${firm.founded}, membru al ${firm.barGenitive}. Peste ${firm.yearsOfExperience} ani de experiență în Timișoara.`,
  alternates: { canonical: "/despre-noi" },
};

export default function DespreNoiPage() {
  return (
    <>
      <ServiceHero title="Despre noi" crumbs={[{ name: "Despre noi", url: "/despre-noi" }]} />

      <section className="px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl">Istoricul cabinetului</h2>
          <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-charcoal-muted">
            <p>
              Cabinetul de Avocat Alina Popa a fost fondat în anul {firm.founded} și activează în
              {" "}
              {firm.city}, fiind membru al {firm.barGenitive}.
            </p>
            <p>
              De peste {firm.yearsOfExperience} ani, activitatea cabinetului este construită în
              jurul unor principii fundamentale: integritate, loialitate, competență,
              profesionalism și confidențialitate.
            </p>
            <p>
              Cabinetul oferă servicii de consultanță juridică și reprezentare în litigii,
              abordând fiecare problemă juridică cu seriozitate, atenție și dorință de
              perfecționare continuă. Experiența acumulată permite abordarea unei game variate de
              probleme juridice, de la drept civil și dreptul familiei, la drept comercial, drept
              fiscal, dreptul muncii și insolvență.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-sand px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl lg:text-3xl">Valori și principii</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {firm.values.map((value) => (
              <ValueCard key={value.name} name={value.name} description={value.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl">Tipuri de servicii</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {firm.serviceTypes.map((type) => (
              <div key={type.name}>
                <dt className="font-display text-base text-ink">{type.name}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-charcoal-muted">
                  {type.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ConfidentialityBlock />

      <CTABanner />
    </>
  );
}
