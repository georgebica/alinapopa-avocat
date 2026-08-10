import { firm, siteUrl } from "@/content/firm";

export function legalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LegalService", "LocalBusiness"],
    "@id": `${siteUrl}/#organization`,
    name: firm.legalName,
    image: `${siteUrl}/og-image.jpg`,
    url: siteUrl,
    telephone: `+4${firm.phone}`,
    email: firm.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address.street,
      addressLocality: firm.address.city,
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
      item: `${siteUrl}${item.url}`,
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
