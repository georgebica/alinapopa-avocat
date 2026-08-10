import Link from "next/link";
import type { ServiceContent } from "@/content/services";
import { ChevronRightIcon } from "./icons";
import { PracticeVideo } from "./PracticeVideo";

export function PracticeAreaCard({ service }: { service: ServiceContent }) {
  return (
    <Link
      href={`/servicii/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-burgundy/40 hover:shadow-[0_18px_40px_-24px_rgba(30,23,25,0.45)] focus-visible:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* The renders are 16:9 with the subject centred and a wide margin of
          empty studio floor either side. Framing them 3:2 crops ~9% off each
          edge, which leaves every subject intact but sitting noticeably larger
          in the card. */}
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        <PracticeVideo
          slug={service.slug}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
        />

        {/* Brass hairline that draws itself along the seam between render and
            text — the card's one moment of the site's accent metal. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-gold transition-[width] duration-500 ease-out group-hover:w-full motion-reduce:transition-none"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg text-ink">{service.shortTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
          {service.cardDescription}
        </p>

        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-burgundy group-hover:text-burgundy-deep">
          Detalii
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
        </span>
      </div>
    </Link>
  );
}
