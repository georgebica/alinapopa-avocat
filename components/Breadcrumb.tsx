import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";
import { ChevronRightIcon } from "./icons";

export type Crumb = { name: string; url: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const full: Crumb[] = [{ name: "Acasă", url: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbSchema(full)} />
      <nav aria-label="breadcrumb" className="text-sm text-charcoal-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {full.map((item, index) => (
            <li key={item.url} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-line" />}
              {index === full.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-bronze-deep">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
