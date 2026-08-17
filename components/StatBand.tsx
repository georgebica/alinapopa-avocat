import { firm } from "@/content/firm";
import { Reveal } from "./Reveal";

const stats = [
  { value: `${firm.yearsOfExperience}+`, label: "ani de experiență" },
  { value: String(firm.founded), label: "anul fondării" },
  { value: firm.bar, label: "apartenență profesională" },
];

/**
 * The trust band under the hero: three credentials set like engraved plaques —
 * a gold tick, the numeral in the display serif, and a small tracked caption.
 * They rise in sequence as the band scrolls into view.
 */
export function StatBand() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 120}>
            <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              <span className="font-display text-4xl tabular-nums text-burgundy lg:text-[2.6rem]">
                {stat.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-charcoal-muted">
                {stat.label}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
