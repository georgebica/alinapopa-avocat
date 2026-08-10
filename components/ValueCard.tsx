export function ValueCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-6">
      <div className="h-px w-10 bg-bronze" />
      <h3 className="mt-4 font-display text-lg text-ink">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">{description}</p>
    </div>
  );
}
