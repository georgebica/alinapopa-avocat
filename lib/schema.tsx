import { firm, siteUrl } from "@/content/firm";
import { services } from "@/content/services";
import type { ServiceContent } from "@/content/services";

/** Stable entity ids, so every block cross-references the same graph nodes. */
const ORG_ID = `${siteUrl}/#organization`;
const PERSON_ID = `${siteUrl}/despre-noi/#person-alina-popa`;
const WEBSITE_ID = `${siteUrl}/#website`;

/** All schema URLs use the trailing-slash form, matching each page's
 *  canonical exactly — the host 301s the slash-less form, and structured-data
 *  URLs should never point through a redirect. */
const pageUrl = (path: string) => (path === "/" ? `${siteUrl}/` : `${siteUrl}${path}/`);

export function legalServiceSchema() {
  return {
    "@context": "https://schema.org",
    // LegalService already inherits LocalBusiness, so one type carries both.
    "@type": "LegalService",
    "@id": ORG_ID,
    name: firm.legalName,
    description: `${firm.positioning} Cabinet de avocatură fondat în ${firm.founded}, membru al ${firm.barGenitive}. Consultanță juridică și reprezentare în litigii în ${firm.city}.`,
    image: `${siteUrl}/og-image.jpg`,
    url: pageUrl("/"),
    telephone: `+4${firm.phone}`,
    email: firm.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address.street,
      addressLocality: firm.address.city,
      addressRegion: "Timiș",
      postalCode: firm.address.postalCode,
      addressCountry: firm.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: firm.geo.latitude,
      longitude: firm.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: firm.hours.days,
      opens: firm.hours.opens,
      closes: firm.hours.closes,
    },
    areaServed: {
      "@type": "City",
      name: firm.city,
    },
    memberOf: {
      "@type": "Organization",
      name: firm.bar,
    },
    foundingDate: String(firm.founded),
    founder: { "@id": PERSON_ID },
    knowsLanguage: "ro",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Domenii de practică",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.shortTitle,
          url: pageUrl(`/servicii/${service.slug}`),
        },
      })),
    },
  };
}

/** The site as an entity, published once from the root layout. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: pageUrl("/"),
    name: firm.legalName,
    inLanguage: "ro",
    publisher: { "@id": ORG_ID },
  };
}

/** The attorney as a Person entity — published on /despre-noi, referenced as
 *  the organization's founder from every page. Only verifiable facts: name,
 *  profession, bar membership. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: firm.shortName,
    jobTitle: "Avocat",
    memberOf: { "@type": "Organization", name: firm.bar },
    worksFor: { "@id": ORG_ID },
    url: pageUrl("/despre-noi"),
  };
}

/** One practice area as a Service tied to the organization, with its
 *  sub-services as the offer catalog. Published on each service page. */
export function serviceSchema(service: ServiceContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.shortTitle,
    serviceType: service.shortTitle,
    description: service.metaDescription,
    url: pageUrl(`/servicii/${service.slug}`),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "City", name: firm.city },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Servicii — ${service.shortTitle}`,
      itemListElement: service.subservices.map((sub) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: sub.name,
          description: sub.description,
        },
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.url),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
