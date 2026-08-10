import type { ServiceContent } from "./types";

export const dreptContraventional: ServiceContent = {
  slug: "drept-contraventional",
  title: "Drept contravențional",
  shortTitle: "Drept contravențional",
  metaDescription:
    "Contestații amenzi și asistență în materie contravențională. Cabinet de Avocat Alina Popa, Timișoara.",
  cardDescription: "Contestații amenzi și asistență în procesele-verbale de constatare a contravenției.",
  intro: [
    "Un proces-verbal de constatare a contravenției poate fi contestat atunci când constatarea faptei sau sancțiunea aplicată nu respectă condițiile legale. Cabinetul de Avocat Alina Popa oferă asistență și reprezentare în materie contravențională, de la analiza procesului-verbal până la reprezentarea în fața instanței.",
    "Termenul de contestare a unui proces-verbal este scurt, motiv pentru care este recomandat ca actul să fie analizat de un avocat cât mai curând de la comunicare.",
  ],
  subservices: [
    {
      name: "Contestații amenzi",
      description:
        "Asistență în redactarea și susținerea plângerilor contravenționale împotriva proceselor-verbale de constatare a contravenției.",
    },
    {
      name: "Asistență și reprezentare în materie contravențională",
      description:
        "Reprezentare în fața autorităților și a instanțelor, în orice etapă a procedurii contravenționale.",
    },
  ],
  faq: [
    {
      question: "În cât timp trebuie contestat un proces-verbal de contravenție?",
      answer:
        "Plângerea contravențională se depune, de regulă, în termen de 15 zile de la comunicarea sau înmânarea procesului-verbal. Termenul exact poate varia în funcție de actul normativ aplicabil, motiv pentru care este utilă o analiză promptă a situației.",
    },
    {
      question: "Pe ce motive poate fi anulat un proces-verbal de contravenție?",
      answer:
        "Un proces-verbal poate fi anulat pentru vicii de formă (elemente obligatorii lipsă sau incorecte) sau pentru netemeinicie, atunci când fapta nu este dovedită sau nu a fost corect încadrată juridic.",
    },
  ],
  relatedSlugs: [
    "drept-fiscal-si-administrativ",
    "dreptul-asigurarilor-si-accidente-rutiere",
    "drept-bancar-si-insolventa",
  ],
};
