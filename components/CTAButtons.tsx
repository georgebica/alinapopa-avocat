import Link from "next/link";
import { telLink, whatsappLink, mailtoLink } from "@/content/firm";
import { PhoneIcon, WhatsAppIcon, MailIcon } from "./icons";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

/**
 * The four contact actions. On phones these stack as a full-width primary CTA
 * above an even three-up row of quick actions — a wrapping row would otherwise
 * spill onto three lines and crowd whatever sits behind it.
 */
export function CTAButtons({ className = "", variant = "light" }: Props) {
  const primary =
    variant === "dark"
      ? "bg-cream text-ink hover:bg-white"
      : "bg-bronze text-cream hover:bg-bronze-deep";
  const secondary =
    variant === "dark"
      ? "border border-cream/40 text-cream hover:bg-cream/10"
      : "border border-line bg-cream/70 text-ink hover:border-bronze hover:text-bronze-deep";

  const secondaryBase = `min-tap inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${secondary}`;

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
