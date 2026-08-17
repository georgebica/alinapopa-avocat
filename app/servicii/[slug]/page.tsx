import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceBySlug, getRelatedServices, services } from "@/content/services";
import { JsonLd, serviceSchema } from "@/lib/schema";
import { ServiceHero } from "@/components/ServiceHero";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTABanner } from "@/components/CTABanner";
import { PracticeAreaCard } from "@/components/PracticeAreaCard";
import { Reveal } from "@/components/Reveal";
import { ShieldIcon } from "@/components/icons";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.metaDescription,
    alternates: { canonical: `/servicii/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.metaDescription,
      url: `/servicii/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = getRelatedServices(service);

  return (
    <>
      {/* The practice area as a Service tied to the organization, with its
          sub-services as the offer catalog. */}
      <JsonLd data={serviceSchema(service)} />
      <ServiceHero
        title={service.title}
        crumbs={[
          { name: "Servicii", url: "/servicii" },
          { name: service.shortTitle, url: `/servicii/${service.slug}` },
        ]}
      />

      <section className="px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-4xl">
          {service.intro.map((paragraph) => (
            <p key={paragraph} className="mb-4 text-base leading-relaxed text-charcoal-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-sand px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl lg:text-3xl">Servicii oferite</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {service.subservices.map((sub) => (
              <div key={sub.name}>
                <dt className="font-display text-base text-ink">{sub.name}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-charcoal-muted">
                  {sub.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line px-6 py-12 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-4xl items-start gap-4 rounded-2xl border border-line bg-surface p-6">
          <ShieldIcon className="h-6 w-6 shrink-0 text-burgundy" />
          <p className="text-sm leading-relaxed text-charcoal-muted">
            Fiecare speță este tratată cu confidențialitate deplină. Consultanța inițială
            presupune o analiză atentă a situației dumneavoastră, pentru identificarea celor mai
            potrivite soluții juridice.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-sand px-6 py-12 lg:px-16 lg:py-16">
        <FAQAccordion items={service.faq} />
      </section>

      {related.length > 0 && (
        <section className="border-t border-line px-6 py-12 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl lg:text-3xl">Domenii conexe</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel, index) => (
                <Reveal key={rel.slug} delay={(index % 3) * 90} className="h-full">
                  <PracticeAreaCard service={rel} />
                </Reveal>
              ))}
            </div>
            <Link
              href="/servicii"
              className="mt-6 inline-block text-sm font-medium text-burgundy-deep hover:underline"
            >
              Vezi toate domeniile de practică →
            </Link>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
