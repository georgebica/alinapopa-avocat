import Link from "next/link";
import { firm, mailtoLink, telLink } from "@/content/firm";
import { services } from "@/content/services";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface px-6 py-14 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg text-ink">{firm.legalName}</p>
          <p className="mt-1 text-sm text-charcoal-muted">{firm.bar}</p>
          <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
            {firm.address.street}
            <br />
            {firm.address.city}, {firm.address.postalCode}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-charcoal-muted">
            <li>
              <a href={telLink()} className="transition-colors hover:text-burgundy-deep">
                {firm.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={mailtoLink()} className="transition-colors hover:text-burgundy-deep">
                {firm.email}
              </a>
            </li>
            <li>{firm.hours.display}</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Domenii de practică</p>
          <ul className="mt-4 space-y-2 text-sm text-charcoal-muted">
            {services.slice(0, 5).map((service) => (
              <li key={service.slug}>
                <Link href={`/servicii/${service.slug}`} className="transition-colors hover:text-burgundy-deep">
                  {service.shortTitle}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/servicii" className="text-burgundy-deep hover:underline">
                Toate domeniile →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Cabinet</p>
          <ul className="mt-4 space-y-2 text-sm text-charcoal-muted">
            <li>
              <Link href="/despre-noi" className="transition-colors hover:text-burgundy-deep">
                Despre noi
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-burgundy-deep">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/politica-de-confidentialitate" className="transition-colors hover:text-burgundy-deep">
                Politica de confidențialitate
              </Link>
            </li>
            <li>
              <Link href="/termeni-si-conditii" className="transition-colors hover:text-burgundy-deep">
                Termeni și condiții
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-line pt-6 text-xs text-charcoal-muted">
        © {year} {firm.legalName}. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
