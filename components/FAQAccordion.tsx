"use client";

import { useState } from "react";
import { JsonLd, faqSchema } from "@/lib/schema";
import { ChevronDownIcon } from "./icons";
import type { FaqItem } from "@/content/services";

export function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl">
      <JsonLd data={faqSchema(items)} />
      <h2 className="text-2xl lg:text-3xl">Întrebări frecvente</h2>
      <div className="mt-6 divide-y divide-line border-t border-line">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="min-tap flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-base font-medium text-ink">{item.question}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 text-bronze transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="pb-5 pr-8 text-sm leading-relaxed text-charcoal-muted">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
