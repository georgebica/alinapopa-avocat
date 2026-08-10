import type { ServiceContent } from "./types";
import { dreptComercialSiAfaceri } from "./drept-comercial-si-afaceri";
import { dreptFiscalSiAdministrativ } from "./drept-fiscal-si-administrativ";
import { dreptCivilSiDreptulFamiliei } from "./drept-civil-si-dreptul-familiei";
import { dreptulMuncii } from "./dreptul-muncii";
import { executariSiliteSiRecuperareCreante } from "./executari-silite-si-recuperare-creante";
import { dreptulAsigurarilorSiAccidenteRutiere } from "./dreptul-asigurarilor-si-accidente-rutiere";
import { dreptContraventional } from "./drept-contraventional";
import { dreptBancarSiInsolventa } from "./drept-bancar-si-insolventa";
import { proprietateIntelectuala } from "./proprietate-intelectuala";

export const services: ServiceContent[] = [
  dreptComercialSiAfaceri,
  dreptFiscalSiAdministrativ,
  dreptCivilSiDreptulFamiliei,
  dreptulMuncii,
  executariSiliteSiRecuperareCreante,
  dreptulAsigurarilorSiAccidenteRutiere,
  dreptContraventional,
  dreptBancarSiInsolventa,
  proprietateIntelectuala,
];

export function getServiceBySlug(slug: string): ServiceContent | undefined {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(service: ServiceContent): ServiceContent[] {
  return service.relatedSlugs
    .map((slug) => getServiceBySlug(slug))
    .filter((s): s is ServiceContent => Boolean(s));
}

export type { ServiceContent, SubService, FaqItem } from "./types";
