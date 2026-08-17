import type { Metadata } from "next";
import { services } from "@/content/services";
import { ServiceHero } from "@/components/ServiceHero";
import { PracticeBand } from "@/components/PracticeBand";
import { Reveal } from "@/components/Reveal";
import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Domenii de practică",
  description:
    "Consultanță juridică și reprezentare în litigii, în cele 9 domenii de practică ale Cabinetului de Avocat Alina Popa din Timișoara.",
  alternates: { canonical: "/servicii" },
  openGraph: { url: "/servicii" },
};

export default function ServiciiPage() {
  return (
    <>
      <ServiceHero title="Domenii de practică" crumbs={[{ name: "Servicii", url: "/servicii" }]} />

      <section className="bg-sand px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="max-w-2xl text-base leading-relaxed text-charcoal-muted">
            Cabinetul de Avocat Alina Popa oferă consultanță juridică și reprezentare în litigii
            într-o gamă variată de domenii, fiecare speță fiind analizată individual, în funcție
            de circumstanțele concrete și obiectivele clientului.
          </p>

          <div className="mt-14 flex flex-col gap-20 lg:mt-20 lg:gap-28">
            {services.map((service, index) => (
              <Reveal key={service.slug}>
                <PracticeBand service={service} index={index} total={services.length} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
