import Link from "next/link";
import type { ServiceContent } from "@/content/services";
import { ChevronRightIcon } from "./icons";
import { PracticeIcon } from "./practiceIcons";

export function PracticeAreaCard({ service }: { service: ServiceContent }) {
  return (
    <Link
      href={`/servicii/${service.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-burgundy/40 hover:shadow-[0_18px_40px_-24px_rgba(30,23,25,0.45)] focus-visible:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* Warm wash that rises from the card's foot on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-sand to-transparent transition-[height] duration-500 ease-out group-hover:h-24 motion-reduce:transition-none"
      />
      {/* Brass hairline that draws itself along the top edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px w-0 bg-gold transition-[width] duration-500 ease-out group-hover:w-full motion-reduce:transition-none"
      />

      <div className="relative">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sand text-burgundy transition-colors duration-300 group-hover:bg-burgundy group-hover:text-surface">
          <PracticeIcon slug={service.slug} className="h-5 w-5" />
        </span>

        <h3 className="mt-4 font-display text-lg text-ink">{service.shortTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
          {service.cardDescription}
        </p>
      </div>

      <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-medium text-burgundy group-hover:text-burgundy-deep">
        Detalii
        <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
      </span>
    </Link>
  );
}
