import { firm } from "@/content/firm";
import { ShieldIcon } from "./icons";

export function ConfidentialityBlock() {
  return (
    <section className="bg-cream px-6 py-16 lg:px-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <ShieldIcon className="h-8 w-8 text-bronze" />
        <h2 className="text-2xl lg:text-3xl">Confidențialitate</h2>
        <p className="text-base leading-relaxed text-charcoal-muted">
          {firm.confidentialityStatement}
        </p>
      </div>
    </section>
  );
}
