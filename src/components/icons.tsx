import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export function EyeIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.4 3.3M6.2 6.7A17 17 0 0 0 2.5 12S6 19 12 19a9 9 0 0 0 3.6-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </svg>
  );
}

export function BellIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function BagIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M6 2 4 5v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5l-2-3Z" />
      <path d="M4 5h16M16 9a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CheckCircleIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 15, height: 15, strokeWidth: 2, ...p })}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function AlertCircleIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 15, height: 15, strokeWidth: 2, ...p })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

export function ShieldCheckIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 36, height: 36, strokeWidth: 1.6, ...p })}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
  );
}

export function ClockIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 36, height: 36, strokeWidth: 1.6, ...p })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ChatBubbleIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.4.2-.1 2.7-1.8 3.8-2.6.6.1 1.3.1 1.9.1 5.5 0 10-3.6 10-8S17.5 3 12 3Z" />
    </svg>
  );
}
