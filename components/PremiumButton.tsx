import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** "md" for page CTAs, "sm" for the nav and the phone action bar. */
  size?: "md" | "sm";
  className?: string;
};

/**
 * The site's one button: a champagne face over a hairline gilt border, with a
 * slow sheen that crosses on hover — light travelling over brushed metal. It
 * reads on both grounds: ivory against the burgundy dark of the closing scene,
 * gilded against the white pages. Everything else that looks clickable is a
 * quiet text link, so this stays the only object on a page that shines.
 */
export function PremiumButton({ href, children, size = "md", className = "" }: Props) {
  const padding = size === "md" ? "px-7 py-3" : "px-5 py-2.5";
  return (
    <Link
      href={href}
      className={`group relative inline-flex min-tap items-center justify-center overflow-hidden rounded-md border border-[#d9c193]/70 bg-gradient-to-b from-[#f8edda] via-[#efdcbc] to-[#e2c9a1] text-sm font-medium tracking-wide text-burgundy-deep shadow-[0_10px_26px_rgba(30,23,25,0.22)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(185,149,92,0.38)] ${padding} ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[220%] motion-reduce:hidden"
      />
      {children}
    </Link>
  );
}
