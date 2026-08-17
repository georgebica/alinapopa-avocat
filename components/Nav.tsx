"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { firm } from "@/content/firm";
import { services } from "@/content/services";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "./icons";
import { PremiumButton } from "./PremiumButton";

const primaryLinks = [
  { href: "/", label: "Acasă" },
  { href: "/despre-noi", label: "Despre noi" },
  { href: "/contact", label: "Contact" },
];

/** Desktop link treatment: quiet ink at rest, burgundy with a gilt hairline
 *  underneath when hovered or when it names the page we're on — the viewer
 *  can always read their location off the header. */
const desktopLink = (active: boolean) =>
  `relative py-1 text-sm transition-colors duration-200 hover:text-burgundy-deep after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-deep after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 ${
    active ? "text-burgundy-deep after:scale-x-100" : "text-ink"
  }`;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

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
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="font-display text-lg text-ink">
          {firm.shortName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/" className={desktopLink(isActive("/"))}>
            Acasă
          </Link>
          <Link href="/despre-noi" className={desktopLink(isActive("/despre-noi"))}>
            Despre noi
          </Link>

          <div className="group relative">
            <Link
              href="/servicii"
              className={`flex items-center gap-1 ${desktopLink(isActive("/servicii"))}`}
            >
              Servicii
              <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            {/* `pt-3` on the outer wrapper is the hover bridge between trigger
                and panel; opening on focus-within keeps the menu reachable on
                the keyboard, not just under a mouse. */}
            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid w-[560px] -translate-y-1 grid-cols-2 gap-x-6 gap-y-1 rounded-xl border border-line bg-surface p-4 shadow-[0_28px_56px_-28px_rgba(30,23,25,0.35)] transition-transform duration-200 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/servicii/${service.slug}`}
                    className="rounded-lg px-3 py-2 text-sm text-charcoal-muted transition-colors duration-150 hover:bg-sand hover:text-burgundy-deep"
                  >
                    {service.shortTitle}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/contact" className={desktopLink(isActive("/contact"))}>
            Contact
          </Link>
          <PremiumButton href="/contact" size="sm">
            Solicită consultație
          </PremiumButton>
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
        <div className="fixed inset-0 z-40 overflow-y-auto bg-surface pt-16 lg:hidden">
          <nav className="flex flex-col gap-1 px-6 py-6">
            {primaryLinks
              .filter((l) => l.href !== "/contact")
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`min-tap flex items-center rounded-lg px-3 py-3 text-base hover:bg-line/40 ${
                    isActive(link.href) ? "font-medium text-burgundy-deep" : "text-ink"
                  }`}
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
                  className="min-tap flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-burgundy-deep hover:bg-line/40"
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

            <PremiumButton href="/contact" size="sm" className="mt-4 w-full">
              Solicită consultație
            </PremiumButton>
          </nav>
        </div>
      )}
    </>
  );
}
