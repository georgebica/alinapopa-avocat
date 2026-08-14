import type { Metadata } from "next";
import { firm } from "@/content/firm";
import { services } from "@/content/services";
import { Hero } from "@/components/Hero";
import { StatBand } from "@/components/StatBand";
import { PracticeBand } from "@/components/PracticeBand";
import { Reveal } from "@/components/Reveal";
import { ValueCard } from "@/components/ValueCard";
import { ConfidentialityBlock } from "@/components/ConfidentialityBlock";
import { CTABanner } from "@/components/CTABanner";
import { MapEmbed } from "@/components/MapEmbed";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "@/components/icons";
import { telLink, mailtoLink } from "@/content/firm";

export const metadata: Metadata = {
  title: `${firm.legalName} | Avocat Timișoara`,
  description: `${firm.positioning} Cabinet de avocatură fondat în ${firm.founded}, membru al ${firm.barGenitive}. Consultanță juridică și reprezentare în litigii.`,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />

      <StatBand />

      <section className="px-6 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-deep sm:text-xs">
              Prezentare
            </p>
            <h2 className="mt-3 text-2xl lg:text-3xl">Cabinet de Avocat Alina Popa</h2>
          </div>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-charcoal-muted">
            <p>
              Cabinetul de Avocat Alina Popa a fost fondat în anul {firm.founded} și activează în
              {" "}
              {firm.city}, fiind membru al {firm.barGenitive}.
            </p>
            <p>
              De peste {firm.yearsOfExperience} ani, activitatea cabinetului este construită în
              jurul unor principii fundamentale: integritate, loialitate, competență,
              profesionalism și confidențialitate. Cabinetul oferă servicii de consultanță
              juridică și reprezentare în litigii, abordând fiecare problemă juridică cu
              seriozitate, atenție și dorință de perfecționare continuă.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-sand px-6 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-deep sm:text-xs">
            Domenii de practică
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl lg:text-3xl">
            Consultanță și reprezentare într-o gamă variată de domenii juridice
          </h2>
          <div className="mt-14 flex flex-col gap-20 lg:mt-20 lg:gap-28">
            {services.map((service, index) => (
              <Reveal key={service.slug}>
                <PracticeBand service={service} index={index} total={services.length} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-deep sm:text-xs">
            Avantaje
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl lg:text-3xl">Valorile cabinetului</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {firm.values.map((value) => (
              <ValueCard key={value.name} name={value.name} description={value.description} />
            ))}
          </div>
        </div>
      </section>

      <ConfidentialityBlock />

      <CTABanner />

      <section className="border-t border-line px-6 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-deep sm:text-xs">Contact</p>
            <h2 className="mt-3 text-2xl lg:text-3xl">Date de contact</h2>

            <ul className="mt-8 flex flex-col gap-5 text-base text-ink">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
                <span>
                  {firm.address.street}
                  <br />
                  {firm.address.city}, {firm.address.postalCode}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 shrink-0 text-burgundy" />
                <a href={telLink()} className="hover:text-burgundy-deep">
                  {firm.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 shrink-0 text-burgundy" />
                <a href={mailtoLink()} className="hover:text-burgundy-deep">
                  {firm.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 shrink-0 text-burgundy" />
                {firm.hours.display}
              </li>
            </ul>
          </div>

          <MapEmbed />
        </div>
      </section>
    </>
  );
}
