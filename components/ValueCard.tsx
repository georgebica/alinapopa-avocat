/**
 * One of the cabinet's principles as a quiet card. On hover the card lifts a
 * breath and its gold tick draws longer — scaleX rather than width, so the
 * hover never touches layout.
 */
export function ValueCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-line bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_24px_48px_-32px_rgba(30,23,25,0.4)] motion-reduce:transform-none">
      <div className="h-px w-10 origin-left bg-gold transition-transform duration-300 ease-out group-hover:scale-x-[1.6]" />
      <h3 className="mt-4 font-display text-lg text-ink">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">{description}</p>
    </div>
  );
}
