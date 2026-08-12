import { firm } from "@/content/firm";
import { CTAButtons } from "./CTAButtons";
import { GavelStrike } from "./gavel/GavelStrike";

export function CTABanner() {
  return (
    <section className="bg-burgundy px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14">
        <div className="flex flex-col items-start gap-6 text-left">
          <h2 className="text-surface text-2xl lg:text-4xl">{firm.cta.title}</h2>
          <p className="max-w-2xl text-base leading-relaxed text-surface/80">{firm.cta.text}</p>
          <CTAButtons variant="dark" />
        </div>

        {/* Purely decorative, and ordered last so it never comes between the
            copy and the actions in the reading order on a phone. */}
        <GavelStrike className="h-[170px] w-full sm:h-[210px] lg:h-[260px]" />
      </div>
    </section>
  );
}
