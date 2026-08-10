import { Breadcrumb, type Crumb } from "./Breadcrumb";

export function ServiceHero({
  title,
  crumbs,
}: {
  title: string;
  crumbs: Crumb[];
}) {
  return (
    <section className="border-b border-line bg-surface px-6 pb-10 pt-8 lg:px-16 lg:pb-14 lg:pt-12">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb items={crumbs} />
        <h1 className="mt-4 text-ink">{title}</h1>
      </div>
    </section>
  );
}
