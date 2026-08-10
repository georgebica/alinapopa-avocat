"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { firm } from "@/content/firm";
import { services } from "@/content/services";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "./icons";

const primaryLinks = [
  { href: "/", label: "Acasă" },
  { href: "/despre-noi", label: "Despre noi" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the mobile drawer on navigation. Adjusting state during render
  // (rather than in an effect) avoids an extra commit/flash of the open drawer.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="font-display text-lg text-ink">
          {firm.shortName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/" className="text-sm text-ink hover:text-bronze-deep">
            Acasă
          </Link>
          <Link href="/despre-noi" className="text-sm text-ink hover:text-bronze-deep">
            Despre noi
          </Link>

          <div className="group relative">
            <Link
              href="/servicii"
              className="flex items-center gap-1 text-sm text-ink hover:text-bronze-deep"
            >
              Servicii
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Link>
            <div className="invisible absolute left-1/2 top-full grid w-[560px] -translate-x-1/2 grid-cols-2 gap-x-6 gap-y-1 rounded-xl border border-line bg-cream p-4 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/servicii/${service.slug}`}
                  className="rounded-lg px-3 py-2 text-sm text-charcoal-muted hover:bg-line/40 hover:text-ink"
                >
                  {service.shortTitle}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/contact" className="text-sm text-ink hover:text-bronze-deep">
            Contact
          </Link>
          <Link
            href="/contact"
            className="min-tap inline-flex items-center rounded-full bg-bronze px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-bronze-deep"
          >
            Solicită consultație
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="min-tap flex items-center justify-center rounded-full text-ink lg:hidden"
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
    </header>

      {open && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-cream pt-16 lg:hidden">
          <nav className="flex flex-col gap-1 px-6 py-6">
            {primaryLinks
              .filter((l) => l.href !== "/contact")
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="min-tap flex items-center rounded-lg px-3 py-3 text-base text-ink hover:bg-line/40"
                >
                  {link.label}
                </Link>
              ))}

            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              className="min-tap flex items-center justify-between rounded-lg px-3 py-3 text-base text-ink hover:bg-line/40"
            >
              Servicii
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {servicesOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l border-line pl-3">
                <Link
                  href="/servicii"
                  className="min-tap flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-bronze-deep hover:bg-line/40"
                >
                  Toate domeniile de practică
                </Link>
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/servicii/${service.slug}`}
                    className="min-tap flex items-center rounded-lg px-3 py-2.5 text-sm text-charcoal-muted hover:bg-line/40 hover:text-ink"
                  >
                    {service.shortTitle}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/contact"
              className="min-tap flex items-center rounded-lg px-3 py-3 text-base text-ink hover:bg-line/40"
            >
              Contact
            </Link>

            <Link
              href="/contact"
              className="min-tap mt-4 flex items-center justify-center rounded-full bg-bronze px-5 py-3 text-sm font-medium text-cream hover:bg-bronze-deep"
            >
              Solicită consultație
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
