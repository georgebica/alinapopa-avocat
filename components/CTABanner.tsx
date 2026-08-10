import { firm } from "@/content/firm";
import { CTAButtons } from "./CTAButtons";

export function CTABanner() {
  return (
    <section className="bg-burgundy px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 text-left">
        <h2 className="text-surface text-2xl lg:text-4xl">{firm.cta.title}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-surface/80">{firm.cta.text}</p>
        <CTAButtons variant="dark" />
      </div>
    </section>
  );
}
