import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Drept comercial și afaceri — storefront / commerce. */
function CommerceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9z" />
      <path d="M3.5 9 5 4.5h14L20.5 9" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

/** Drept fiscal și administrativ — official document with a stamp. */
function FiscalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

/** Drept civil și dreptul familiei — two figures. */
function FamilyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="7.5" r="2.75" />
      <circle cx="16.5" cy="9" r="2.25" />
      <path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13a4.5 4.5 0 0 1 4.5 4.5V19" />
      <path d="M14 19v-1a3.5 3.5 0 0 1 6.5-1.8" />
    </svg>
  );
}

/** Dreptul muncii — hard hat / workplace. */
function LabourIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 16a8.5 8.5 0 0 1 17 0" />
      <path d="M2.5 16h19" />
      <path d="M10 7.8V5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.3" />
      <path d="M6.5 19.5h11" />
    </svg>
  );
}

/** Executări silite și recuperare creanțe — coins recovered. */
function RecoveryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.75" />
      <path d="M5.5 6.5v5c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75v-5" />
      <path d="M5.5 11.5v5c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75v-5" />
    </svg>
  );
}

/** Dreptul asigurărilor și accidente rutiere — vehicle. */
function VehicleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16v2.5M20 16v2.5" />
      <path d="M3 16v-3.2L4.8 8A1.5 1.5 0 0 1 6.2 7h11.6a1.5 1.5 0 0 1 1.4 1L21 12.8V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M4.6 12.6h14.8" />
      <circle cx="7.5" cy="14.6" r="1" />
      <circle cx="16.5" cy="14.6" r="1" />
    </svg>
  );
}

/** Drept contravențional — traffic sign / citation. */
function CitationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" />
      <path d="M12 7.8v5" />
      <path d="M12 15.8h.01" />
    </svg>
  );
}

/** Drept bancar și insolvență — bank colonnade. */
function BankIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 9.5 12 4.5l8.5 5" />
      <path d="M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8" />
      <path d="M3 19.5h18" />
    </svg>
  );
}

/** Proprietate intelectuală — idea protected. */
function IntellectualPropertyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 17.5h6" />
      <path d="M10 20.5h4" />
      <path d="M12 3.5a5.5 5.5 0 0 1 3.2 9.97c-.5.36-.8.93-.8 1.53H9.6c0-.6-.3-1.17-.8-1.53A5.5 5.5 0 0 1 12 3.5z" />
    </svg>
  );
}

/** Fallback — scales of justice. */
function ScalesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v16M7 20h10" />
      <path d="M4.5 8h15" />
      <path d="M4.5 8 2 13.5h5L4.5 8zM19.5 8 17 13.5h5L19.5 8z" />
    </svg>
  );
}

/**
 * Dispatches with JSX rather than looking a component up in a map: assigning a
 * component to a variable mid-render trips react-hooks/static-components, which
 * cannot tell that the candidates are all module-level.
 */
export function PracticeIcon({ slug, ...props }: IconProps & { slug: string }) {
  switch (slug) {
    case "drept-comercial-si-afaceri":
      return <CommerceIcon {...props} />;
    case "drept-fiscal-si-administrativ":
      return <FiscalIcon {...props} />;
    case "drept-civil-si-dreptul-familiei":
      return <FamilyIcon {...props} />;
    case "dreptul-muncii":
      return <LabourIcon {...props} />;
    case "executari-silite-si-recuperare-creante":
      return <RecoveryIcon {...props} />;
    case "dreptul-asigurarilor-si-accidente-rutiere":
      return <VehicleIcon {...props} />;
    case "drept-contraventional":
      return <CitationIcon {...props} />;
    case "drept-bancar-si-insolventa":
      return <BankIcon {...props} />;
    case "proprietate-intelectuala":
      return <IntellectualPropertyIcon {...props} />;
    default:
      return <ScalesIcon {...props} />;
  }
}
