import Link from "next/link";
import { telLink, whatsappLink, mailtoLink } from "@/content/firm";
import { PhoneIcon, WhatsAppIcon, MailIcon } from "./icons";

type Props = {
  className?: string;
  variant?: "light" | "dark";
  /**
   * "bar" collapses the four actions onto a single row — the labelled primary
   * plus icon-only quick actions — for the fixed phone bar, where two stacked
   * rows would eat an eighth of the screen.
   */
  layout?: "stack" | "bar";
};

/**
 * The four contact actions. On phones these stack as a full-width primary CTA
 * above an even three-up row of quick actions — a wrapping row would otherwise
 * spill onto three lines and crowd whatever sits behind it.
 */
export function CTAButtons({ className = "", variant = "light", layout = "stack" }: Props) {
  const primary =
    variant === "dark"
      ? "bg-surface text-ink hover:bg-sand"
      : "bg-burgundy text-surface hover:bg-burgundy-deep";
  const secondary =
    variant === "dark"
      ? "border border-surface/40 text-surface hover:bg-surface/10"
      : "border border-line bg-surface/70 text-ink hover:border-burgundy hover:text-burgundy-deep";

  const secondaryBase = `min-tap inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${secondary}`;

  if (layout === "bar") {
    const iconAction = `min-tap inline-flex shrink-0 items-center justify-center rounded-full px-3 transition-colors ${secondary}`;
    return (
      <div className={`flex w-full items-stretch gap-2 ${className}`}>
        <Link
          href="/contact"
          className={`min-tap inline-flex flex-1 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${primary}`}
        >
          Solicită consultație
        </Link>
        <a href={telLink()} aria-label="Sună acum" title="Sună acum" className={iconAction}>
          <PhoneIcon className="h-5 w-5" />
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Scrieți pe WhatsApp"
          title="WhatsApp"
          className={iconAction}
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>
        <a
          href={mailtoLink()}
          aria-label="Trimiteți un email"
          title="Email"
          className={iconAction}
        >
          <MailIcon className="h-5 w-5" />
        </a>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap ${className}`}>
      <Link
        href="/contact"
        className={`min-tap inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors sm:w-auto ${primary}`}
      >
        Solicită consultație
      </Link>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
        <a href={telLink()} className={secondaryBase}>
          <PhoneIcon className="h-4 w-4 shrink-0" />
          {/* One flex item, so the icon gap isn't duplicated before "acum". */}
          <span>
            Sună<span className="hidden sm:inline"> acum</span>
          </span>
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryBase}
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
        <a href={mailtoLink()} className={secondaryBase}>
          <MailIcon className="h-4 w-4 shrink-0" />
          Email
        </a>
      </div>
    </div>
  );
}
