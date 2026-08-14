import { telLink, whatsappLink, mailtoLink } from "@/content/firm";
import { PhoneIcon, WhatsAppIcon, MailIcon } from "./icons";
import { PremiumButton } from "./PremiumButton";

type Props = {
  className?: string;
  variant?: "light" | "dark";
  /**
   * "bar" collapses the actions onto a single row — the champagne primary
   * plus icon-only quick actions — for the fixed phone bar, where two stacked
   * rows would eat an eighth of the screen.
   */
  layout?: "stack" | "bar";
};

/**
 * The contact actions in the site's closing aesthetic: one champagne primary,
 * and the three direct channels as whisper-quiet text links behind thin
 * separators. The channels are footnotes to the consultation CTA, never a
 * second row of buttons competing with it.
 */
export function CTAButtons({ className = "", variant = "light", layout = "stack" }: Props) {
  const quiet = `inline-flex min-tap items-center gap-2 text-[13px] tracking-wide transition-colors ${
    variant === "dark"
      ? "text-surface/55 hover:text-gold"
      : "text-charcoal-muted hover:text-burgundy-deep"
  }`;
  const separator = variant === "dark" ? "bg-surface/15" : "bg-line";

  if (layout === "bar") {
    const iconAction = `min-tap inline-flex shrink-0 items-center justify-center px-1 transition-colors ${
      variant === "dark"
        ? "text-surface/70 hover:text-gold"
        : "text-charcoal-muted hover:text-burgundy-deep"
    }`;
    return (
      <div className={`flex w-full items-center gap-1 ${className}`}>
        <PremiumButton href="/contact" size="sm" className="flex-1">
          Solicită consultație
        </PremiumButton>
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
    <div className={`flex w-full flex-col items-start gap-5 sm:w-auto ${className}`}>
      <PremiumButton href="/contact" className="w-full sm:w-auto">
        Solicită o consultație
      </PremiumButton>

      <div className="flex items-center">
        <a href={telLink()} className={`${quiet} pr-5`}>
          <PhoneIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
          {/* One flex item, so the icon gap isn't duplicated before "acum". */}
          <span>
            Sună<span className="hidden sm:inline"> acum</span>
          </span>
        </a>
        <span aria-hidden="true" className={`h-4 w-px ${separator}`} />
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${quiet} px-5`}
        >
          <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
          WhatsApp
        </a>
        <span aria-hidden="true" className={`h-4 w-px ${separator}`} />
        <a href={mailtoLink()} className={`${quiet} pl-5`}>
          <MailIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
          Email
        </a>
      </div>
    </div>
  );
}
