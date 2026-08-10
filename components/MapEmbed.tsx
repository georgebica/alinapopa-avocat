import { firm } from "@/content/firm";

export function MapEmbed() {
  const query = encodeURIComponent(
    `${firm.address.street}, ${firm.address.city}, ${firm.address.postalCode}, ${firm.address.country}`
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <iframe
        title={`Locație ${firm.legalName}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        className="h-80 w-full grayscale-[15%] lg:h-96"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
