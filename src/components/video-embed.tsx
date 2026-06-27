import type { CSSProperties } from "react";

const FILL: CSSProperties = { width: "100%", height: "100%", border: "none", display: "block" };

function toEmbed(url: string): string | null {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function VideoEmbed({ url, style }: { url: string; style?: CSSProperties }) {
  const embed = toEmbed(url);
  return (
    <div style={style}>
      {embed ? (
        <iframe
          src={embed}
          title="동영상"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={FILL}
        />
      ) : (
        <video src={url} controls playsInline style={{ ...FILL, objectFit: "contain", background: "#000" }} />
      )}
    </div>
  );
}
