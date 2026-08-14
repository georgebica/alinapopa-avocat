// Single source of truth for firm identity, contact (NAP), and hours.
// Pulled from info.txt — used by schema, footer, contact page, CTAs.

export const firm = {
  legalName: "Alina Popa – Cabinet de Avocat",
  shortName: "Alina Popa",
  founded: 2009,
  yearsOfExperience: 15,
  bar: "Baroul Timiș",
  /** Genitive form — required after "membru al …" in Romanian. */
  barGenitive: "Baroului Timiș",
  city: "Timișoara",

  phone: "0731404748",
  phoneDisplay: "0731 404 748",
  whatsapp: "40731404748", // international format for wa.me links
  email: "avocatgorganalina@yahoo.com",

  address: {
    street: "Strada Gheorghe Lazăr 32",
    city: "Timișoara",
    postalCode: "300386",
    country: "România",
    countryCode: "RO",
  },

  geo: {
    // Approximate coordinates for Str. Gheorghe Lazăr 32, Timișoara — refine if precise geocode available.
    latitude: 45.7537,
    longitude: 21.2257,
  },

  hours: {
    opens: "09:00",
    closes: "17:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    display: "Luni – Vineri: 09:00 – 17:00",
  },

  positioning: "Experiență, integritate și profesionalism în fiecare demers juridic.",

  positioningAlternatives: [
    "Soluții juridice construite cu experiență și responsabilitate.",
    "Peste 15 ani de experiență în sprijinul clienților noștri.",
    "Fiecare speță este tratată cu seriozitate, competență și confidențialitate.",
  ],

  confidentialityStatement:
    "Confidențialitatea relației avocat-client reprezintă un principiu fundamental al activității noastre. Din respect pentru clienții noștri și pentru caracterul confidențial al relației profesionale, nu veți găsi online referiri la identitatea acestora.",

  values: [
    {
      name: "Integritate",
      description:
        "Fiecare client și fiecare speță sunt tratate cu seriozitate, corectitudine și responsabilitate profesională.",
    },
    {
      name: "Loialitate",
      description:
        "Interesele legitime ale clientului sunt tratate cu prioritate, în limitele legii și ale normelor profesiei de avocat.",
    },
    {
      name: "Competență",
      description:
        "Experiența acumulată în peste 15 ani de activitate permite abordarea unei game variate de probleme juridice.",
    },
    {
      name: "Profesionalism",
      description:
        "Fiecare speță este analizată individual, cu atenție la particularitățile și obiectivele clientului.",
    },
    {
      name: "Confidențialitate",
      description:
        "Relația avocat-client este bazată pe confidențialitate. Cabinetul respectă caracterul confidențial al informațiilor și nu publică online identitatea clienților.",
    },
  ],

  serviceTypes: [
    {
      name: "Consultanță juridică",
      description:
        "Analiza situației juridice a clientului și identificarea opțiunilor disponibile, a riscurilor și a soluțiilor juridice aplicabile.",
    },
    {
      name: "Reprezentare în litigii",
      description:
        "Asistență și reprezentare juridică în fața instanțelor și a autorităților competente.",
    },
    {
      name: "Asistență juridică",
      description:
        "Sprijin juridic în redactarea, verificarea și analizarea documentelor și contractelor.",
    },
    {
      name: "Soluții personalizate",
      description:
        "Fiecare speță este analizată individual, în funcție de circumstanțele concrete și obiectivele clientului.",
    },
  ],

  cta: {
    title: "Aveți nevoie de ajutor juridic?",
    text: "Prezentați-ne situația dumneavoastră și vom analiza împreună pașii juridici care pot fi urmați.",
  },
} as const;

/**
 * Absolute base for canonical tags, OG tags and JSON-LD. Includes the GitHub
 * Pages project sub-path; swap for the bare domain when a custom domain is
 * pointed at the site (and clear PAGES_BASE_PATH in next.config.ts to match).
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://georgebica.github.io/alinapopa-avocat";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${firm.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink() {
  return `tel:+4${firm.phone}`;
}

export function mailtoLink(subject?: string) {
  return subject ? `mailto:${firm.email}?subject=${encodeURIComponent(subject)}` : `mailto:${firm.email}`;
}
