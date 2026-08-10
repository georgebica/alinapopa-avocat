import { firm } from "@/content/firm";

const stats = [
  { value: `${firm.yearsOfExperience}+`, label: "ani de experiență" },
  { value: String(firm.founded), label: "anul fondării" },
  { value: firm.bar, label: "apartenență profesională" },
];

export function StatBand() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-10 text-center">
            <span className="font-display text-3xl text-burgundy lg:text-4xl">{stat.value}</span>
            <span className="text-sm text-charcoal-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
