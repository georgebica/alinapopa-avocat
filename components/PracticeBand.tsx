import Link from "next/link";
import type { ServiceContent } from "@/content/services";
import { ChevronRightIcon } from "./icons";
import { PracticeVideo } from "./PracticeVideo";

type Props = {
  service: ServiceContent;
  index: number;
  total: number;
};

const ordinal = (n: number) => String(n).padStart(2, "0");

/**
 * One practice area given a full row of the page: the looping render on one
 * side, the name and teaser on the other, sides swapping as the list descends.
 *
 * The heading carries the only real link and stretches an overlay across the
 * whole row, so the entire band is clickable while a screen reader still hears
 * a single link named after the practice area rather than the teaser as well.
 */
export function PracticeBand({ service, index, total }: Props) {
  const flipped = index % 2 === 1;

  return (
    <article className="group relative grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div
        className={`relative overflow-hidden rounded-2xl border border-line bg-sand transition-[border-color,box-shadow] duration-500 ease-out group-hover:border-burgundy/30 group-hover:shadow-[0_28px_60px_-36px_rgba(30,23,25,0.5)] ${
          flipped ? "lg:order-last" : ""
        }`}
      >
        {/* Shown at its native 16:9, so nothing of the render is cropped away. */}
        <PracticeVideo
          spotlight
          slug={service.slug}
          className="aspect-video w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
        />
      </div>

      <div className={flipped ? "lg:pr-8" : "lg:pl-8"}>
        <p className="font-display text-sm tracking-[0.2em] text-gold-deep">
          {ordinal(index + 1)}
          <span className="px-2 text-line">/</span>
          <span className="text-charcoal-muted/70">{ordinal(total)}</span>
        </p>

        <h3 className="mt-4 text-2xl lg:text-3xl">
          <Link
            href={`/servicii/${service.slug}`}
            className="transition-colors duration-300 after:absolute after:inset-0 group-hover:text-burgundy"
          >
            {service.shortTitle}
          </Link>
        </h3>

        <p className="mt-4 max-w-md text-base leading-relaxed text-charcoal-muted">
          {service.cardDescription}
        </p>

        {/* The stretched heading link already covers this row. */}
        <span
          aria-hidden="true"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-burgundy group-hover:text-burgundy-deep"
        >
          Detalii
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
        </span>
      </div>
    </article>
  );
}
