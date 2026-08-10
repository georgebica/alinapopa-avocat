import Link from "next/link";
import type { ServiceContent } from "@/content/services";
import { ChevronRightIcon } from "./icons";

export function PracticeAreaCard({ service }: { service: ServiceContent }) {
  return (
    <Link
      href={`/servicii/${service.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-bronze"
    >
      <div>
        <h3 className="font-display text-lg text-ink">{service.shortTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
          {service.cardDescription}
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-bronze group-hover:text-bronze-deep">
        Detalii
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
