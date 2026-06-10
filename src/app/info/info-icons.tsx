import type { SVGProps } from "react";

const stroke = (p: SVGProps<SVGSVGElement>, sw = 1.6) => ({
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export function PencilIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" {...stroke(p, 1.5)}>
      <path d="M11.5 2.5a1.4 1.4 0 0 1 2 2L5 13l-3 .8.8-3 8.7-8.3Z" />
    </svg>
  );
}

export function SearchIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" {...stroke(p, 1.4)}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="m11 11 3 3" />
    </svg>
  );
}

export function FireIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={12} height={16} viewBox="0 0 12 16" fill="currentColor" {...p}>
      <path d="M6 0C6 3 2.5 4 2.5 8a3.5 3.5 0 0 0 7 0c0-1.4-.6-2.4-1.3-3.2.1.8-.3 1.5-1 1.7.4-2.2-.4-4.5-1.2-6.5Z" />
    </svg>
  );
}

export function BookmarkIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={8} height={8} viewBox="0 0 12 12" fill="currentColor" {...p}>
      <path d="M3 1h6a1 1 0 0 1 1 1v9l-4-2.2L2 11V2a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function UserIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={11} height={11} viewBox="0 0 12 12" {...stroke(p, 1.3)}>
      <circle cx="6" cy="4" r="2.3" />
      <path d="M2 11c0-2.2 1.8-3.5 4-3.5S10 8.8 10 11" />
    </svg>
  );
}

export function CommentIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={11} height={11} viewBox="0 0 12 12" {...stroke(p, 1.3)}>
      <path d="M1.5 3.2a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v3.4a1.5 1.5 0 0 1-1.5 1.5H5L2.5 10.3V8.1A1.5 1.5 0 0 1 1.5 6.6V3.2Z" />
    </svg>
  );
}

export function EyeIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={11} height={11} viewBox="0 0 12 12" {...stroke(p, 1.3)}>
      <path d="M1 6S2.8 2.8 6 2.8 11 6 11 6 9.2 9.2 6 9.2 1 6 1 6Z" />
      <circle cx="6" cy="6" r="1.5" />
    </svg>
  );
}

export function LikeIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={12} height={12} viewBox="0 0 14 14" {...stroke(p, 1.3)}>
      <path d="M4 6 6.4 1.2c.6 0 1.2.5 1.2 1.2V5h3a1.2 1.2 0 0 1 1.2 1.4l-.8 4A1.2 1.2 0 0 1 9.8 11.5H4V6Z" />
      <path d="M4 6H2v5.5h2" />
    </svg>
  );
}

export function DislikeIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={12} height={12} viewBox="0 0 14 14" {...stroke(p, 1.3)}>
      <path d="M10 8 7.6 12.8c-.6 0-1.2-.5-1.2-1.2V9H3.4a1.2 1.2 0 0 1-1.2-1.4l.8-4A1.2 1.2 0 0 1 4.2 2.5H10V8Z" />
      <path d="M10 8h2V2.5h-2" />
    </svg>
  );
}

export function PaperclipIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" {...stroke(p, 1.3)}>
      <path d="M12 6.5 7 11.5a3 3 0 0 1-4.3-4.3L8 1.9a2 2 0 0 1 2.8 2.8L5.6 9.9a1 1 0 0 1-1.4-1.4L9 3.7" />
    </svg>
  );
}

export function FileIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={17} height={17} viewBox="0 0 18 18" {...stroke(p, 1.4)}>
      <path d="M4 2h6l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M10 2v4h4" />
    </svg>
  );
}

export function DownloadIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={17} height={17} viewBox="0 0 18 18" {...stroke(p, 1.4)}>
      <path d="M9 2v8m0 0L6 7m3 3 3-3" />
      <path d="M3 13v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" />
    </svg>
  );
}

export function ThumbUpIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={30} height={29} viewBox="0 0 30 29" {...stroke(p, 1.8)}>
      <path d="M9 13 14 3c1.3 0 2.4 1 2.4 2.4V11h6.4a2.4 2.4 0 0 1 2.4 2.9l-1.6 8.2a2.4 2.4 0 0 1-2.4 1.9H9V13Z" />
      <path d="M9 13H4v11h5" />
    </svg>
  );
}

export function ThumbDownIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={30} height={29} viewBox="0 0 30 29" {...stroke(p, 1.8)}>
      <path d="M21 16 16 26c-1.3 0-2.4-1-2.4-2.4V18H7.2a2.4 2.4 0 0 1-2.4-2.9l1.6-8.2A2.4 2.4 0 0 1 8.8 5H21v11Z" />
      <path d="M21 16h5V5h-5" />
    </svg>
  );
}

export function CommentsHeaderIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" {...stroke(p, 1.5)}>
      <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6l-3 3v-3a2 2 0 0 1-1-2V4Z" />
    </svg>
  );
}

export function HotCommentIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" fill="currentColor" {...p}>
      <path d="M7 1C7 3 4 4 4 6.5a3 3 0 0 0 6 0C10 5.3 9.5 4.4 8.9 3.7c.1.7-.3 1.3-.9 1.5C8.3 3.4 7.6 2.5 7 1Z" />
    </svg>
  );
}

export function ReplyIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" {...stroke(p, 1.3)}>
      <path d="M5 2 1.5 5.5 5 9" />
      <path d="M1.5 5.5H7a3.5 3.5 0 0 1 3.5 3.5v.5" />
    </svg>
  );
}

export function CornerIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" {...stroke(p, 1.3)}>
      <path d="M2 1v6a3 3 0 0 0 3 3h7" />
    </svg>
  );
}

export function ChevronLeftIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={5} height={9} viewBox="0 0 6 10" {...stroke(p, 1.5)}>
      <path d="M5 1 1 5l4 4" />
    </svg>
  );
}

export function ChevronRightIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={5} height={9} viewBox="0 0 6 10" {...stroke(p, 1.5)}>
      <path d="m1 1 4 4-4 4" />
    </svg>
  );
}

export function ChevronDownIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={10} height={10} viewBox="0 0 12 12" {...stroke(p, 1.5)}>
      <path d="m2 4 4 4 4-4" />
    </svg>
  );
}

export function BreadcrumbBackIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" {...stroke(p, 1.4)}>
      <path d="M8.5 3 4.5 7l4 4" />
    </svg>
  );
}

export function VideoIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" {...stroke(p, 1.4)}>
      <rect x="1.5" y="3" width="11" height="8" rx="1.5" />
      <path d="m6 5.5 3 1.5-3 1.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" {...stroke(p, 1.4)}>
      <path d="M6 8a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 8 2.5L7 3.5" />
      <path d="M8 6a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 6 11.5L7 10.5" />
    </svg>
  );
}

export function UploadIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" {...stroke(p, 1.4)}>
      <path d="M7 9V2m0 0L4.5 4.5M7 2l2.5 2.5" />
      <path d="M2 9.5V11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function CheckIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" {...stroke(p, 1.8)}>
      <path d="m2.5 7.5 3 3 6-7" />
    </svg>
  );
}
