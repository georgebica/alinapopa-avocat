export type SubService = {
  name: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ServiceContent = {
  slug: string;
  /** H1 on the service page */
  title: string;
  /** Short label for nav/cards */
  shortTitle: string;
  metaDescription: string;
  /** Teaser used on the homepage practice-area grid */
  cardDescription: string;
  /** Intro paragraphs, rendered under the ServiceHero */
  intro: string[];
  subservices: SubService[];
  faq: FaqItem[];
  relatedSlugs: string[];
};
