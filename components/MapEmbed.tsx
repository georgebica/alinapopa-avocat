import { firm } from "@/content/firm";
import { ChevronRightIcon } from "./icons";

export function MapEmbed() {
  const query = encodeURIComponent(
    `${firm.address.street}, ${firm.address.city}, ${firm.address.postalCode}, ${firm.address.country}`
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-line">
        <iframe
          title={`Locație ${firm.legalName}`}
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="h-80 w-full grayscale-[15%] lg:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {/* The embed pans and zooms, but the errand people actually run is
          "get directions on my phone" — hand them straight to the real app. */}
      <a
        href={`https://www.google.com/maps?q=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-tap items-center gap-1 self-start text-sm font-medium text-burgundy transition-colors hover:text-burgundy-deep"
      >
        Deschideți în Google Maps
        <ChevronRightIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
