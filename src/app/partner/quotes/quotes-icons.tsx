
type IconProps = { className?: string; style?: React.CSSProperties };

export function BoxIcon({ color = "#FFFFFF", ...props }: IconProps & { color?: string }) {
  return (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M6.5 0L13 3.75V11.25L6.5 15L0 11.25V3.75L6.5 0ZM2.05 4.155L6.5 6.72L10.95 4.155L6.5 1.59L2.05 4.155ZM1.3 5.31V10.44L6.5 13.44V8.31L1.3 5.31ZM7.7 13.44L12.7 10.44V5.31L7.7 8.31V13.44Z" fill={color} />
    </svg>
  );
}

export function DocIcon({ color = "#4B5563", ...props }: IconProps & { color?: string }) {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M8.4 0H1.4C0.63 0 0 0.63 0 1.4V13.6C0 14.37 0.63 15 1.4 15H12.6C13.37 15 14 14.37 14 13.6V5.6L8.4 0ZM12.6 13.6H1.4V1.4H7.7V6.3H12.6V13.6ZM3.5 8.4H10.5V9.8H3.5V8.4ZM3.5 10.85H10.5V12.25H3.5V10.85Z" fill={color} />
    </svg>
  );
}

export function StatBoxIcon(props: IconProps) {
  return (
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M7 0L14 4V9L7 13L0 9V4L7 0ZM2.21 4.43L7 7.18L11.79 4.43L7 1.68L2.21 4.43ZM1.4 5.66V8.59L6.3 11.39V8.46L1.4 5.66ZM7.7 11.39L12.6 8.59V5.66L7.7 8.46V11.39Z" fill="#1E3A5F" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M5 0C2.79 0 1 1.79 1 4C1 7 5 11 5 11C5 11 9 7 9 4C9 1.79 7.21 0 5 0ZM5 5.4C4.23 5.4 3.6 4.77 3.6 4C3.6 3.23 4.23 2.6 5 2.6C5.77 2.6 6.4 3.23 6.4 4C6.4 4.77 5.77 5.4 5 5.4Z" fill="#9CA3AF" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ color = "#1E3A5F", ...props }: IconProps & { color?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <circle cx="4.5" cy="4.5" r="3.8" stroke={color} strokeWidth="1.2" />
      <path d="M7.5 7.5L10.3 10.3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M1 1L9 9M9 1L1 9" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ClipIcon({ color = "#6B7280", ...props }: IconProps & { color?: string }) {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <path d="M10.5 6.5L5.7 11.3C4.65 12.35 2.95 12.35 1.9 11.3C0.85 10.25 0.85 8.55 1.9 7.5L7 2.4C7.7 1.7 8.83 1.7 9.53 2.4C10.23 3.1 10.23 4.23 9.53 4.93L4.78 9.68C4.43 10.03 3.87 10.03 3.52 9.68C3.17 9.33 3.17 8.77 3.52 8.42L7.95 4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      <rect x="0.7" y="2.2" width="14.6" height="12.1" rx="1.5" stroke="#9CA3AF" strokeWidth="1.2" />
      <path d="M4.5 0.7V3.5M11.5 0.7V3.5M0.7 6H15.3" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PageArrowIcon({ dir = "left", ...props }: IconProps & { dir?: "left" | "right" }) {
  return (
    <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={props.className} style={props.style}>
      {dir === "left" ? (
        <path d="M5 1L1.5 4.5L5 8" stroke="#4B5563" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M1 1L4.5 4.5L1 8" stroke="#4B5563" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
