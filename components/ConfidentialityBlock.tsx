import { firm } from "@/content/firm";
import { Reveal } from "./Reveal";
import { ShieldIcon } from "./icons";

/**
 * The confidentiality statement set as a plaque: a sand panel with the shield
 * held in a thin gilt ring. This is the last thing read before the closing
 * scene, so it is staged as a promise rather than a paragraph.
 */
export function ConfidentialityBlock() {
  return (
    <section className="bg-surface px-6 py-16 lg:px-16 lg:py-20">
      <Reveal className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-line bg-sand px-6 py-12 text-center sm:px-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-surface">
            <ShieldIcon className="h-6 w-6 text-gold-deep" />
          </div>
          {/* Not the bare word "Confidențialitate": the value card below the
              fold carries that exact heading already, and duplicate heading
              text on one page reads as thin structure to auditors. */}
          <h2 className="mt-5 text-2xl lg:text-3xl">Confidențialitatea relației avocat-client</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal-muted">
            {firm.confidentialityStatement}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
