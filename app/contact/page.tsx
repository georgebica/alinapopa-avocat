import type { Metadata } from "next";
import { firm, telLink, mailtoLink, whatsappLink } from "@/content/firm";
import { ServiceHero } from "@/components/ServiceHero";
import { MapEmbed } from "@/components/MapEmbed";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contactați Cabinetul de Avocat Alina Popa din ${firm.city}. Telefon: ${firm.phoneDisplay}, email: ${firm.email}.`,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const CONSULTATION_SUBJECT = "Solicitare consultație juridică";

export default function ContactPage() {
  return (
    <>
      <ServiceHero title="Contact" crumbs={[{ name: "Contact", url: "/contact" }]} />

      <section className="px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl lg:text-3xl">Solicitați o consultație juridică</h2>
            <p className="mt-3 text-base leading-relaxed text-charcoal-muted">
              Prezentați-ne situația dumneavoastră și vom analiza împreună pașii juridici care pot
              fi urmați. Ne puteți contacta telefonic, pe WhatsApp sau prin email, în timpul
              programului de lucru.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <a
              href={telLink()}
              className="min-tap flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-burgundy"
            >
              <PhoneIcon className="h-6 w-6 text-burgundy" />
              <span className="font-display text-lg text-ink">Sunați acum</span>
              <span className="text-sm text-charcoal-muted">{firm.phoneDisplay}</span>
            </a>

            <a
              href={whatsappLink(
                "Bună ziua, aș dori o consultație juridică la Cabinetul de Avocat Alina Popa."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="min-tap flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-burgundy"
            >
              <WhatsAppIcon className="h-6 w-6 text-burgundy" />
              <span className="font-display text-lg text-ink">Scrieți pe WhatsApp</span>
              <span className="text-sm text-charcoal-muted">{firm.phoneDisplay}</span>
            </a>

            <a
              href={mailtoLink(CONSULTATION_SUBJECT)}
              className="min-tap flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-burgundy"
            >
              <MailIcon className="h-6 w-6 text-burgundy" />
              <span className="font-display text-lg text-ink">Trimiteți un email</span>
              <span className="break-all text-sm text-charcoal-muted">{firm.email}</span>
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-sand p-6">
            <p className="text-sm font-medium text-ink">
              Ce este util să includeți în primul mesaj
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-charcoal-muted">
              <li>o scurtă descriere a situației juridice;</li>
              <li>domeniul de care ține speța (de exemplu drept civil, muncă, comercial);</li>
              <li>termenele sau datele limită de care aveți cunoștință;</li>
              <li>un număr de telefon la care puteți fi contactat.</li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-charcoal-muted">
              Vă rugăm să nu transmiteți documente sau date sensibile înainte de stabilirea unei
              relații de asistență juridică. Primul contact are rol de evaluare preliminară.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium text-ink">{firm.legalName}</p>
              <p className="text-sm text-charcoal-muted">{firm.bar}</p>

              <ul className="mt-6 flex flex-col gap-4 text-sm text-ink">
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
        </div>
      </section>
    </>
  );
}
