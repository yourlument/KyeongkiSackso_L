"use client";

import DOMPurify from "isomorphic-dompurify";

const TERM_HTML_CSS = `
.term-html { font-size: 14px; line-height: 25.2px; letter-spacing: -0.195px; color: rgba(29,29,31,0.7); }
.term-html > :first-child { margin-top: 0; }
.term-html p { margin: 0 0 4px; }
.term-html strong { font-weight: 700; }
.term-html h1 { font-size: 20px; font-weight: 700; margin: 16px 0 4px; color: #1D1D1F; }
.term-html h2 { font-size: 18px; font-weight: 700; margin: 16px 0 4px; color: #1D1D1F; }
.term-html h3 { font-size: 16px; font-weight: 700; margin: 16px 0 4px; color: #1D1D1F; }
.term-html ul { list-style: disc; padding-left: 1.4em; margin: 4px 0; }
.term-html ol { list-style: decimal; padding-left: 1.4em; margin: 4px 0; }
.term-html li { margin: 2px 0; }
.term-html a { color: #0071E3; text-decoration: underline; }
.term-html blockquote { border-left: 3px solid #D2D2D7; padding-left: 12px; margin: 4px 0; }
.term-html img { max-width: 100%; height: auto; }
`;

export function TermContent({ content, contentHtml }: { content: string; contentHtml?: string | null }) {
  if (contentHtml && contentHtml.trim()) {
    return (
      <>
        <style>{TERM_HTML_CSS}</style>
        <div className="term-html" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }} />
      </>
    );
  }
  return (
    <>
      {content.split("\n").map((ln, i) =>
        /^제\d+조/.test(ln) ? (
          <p key={i} className="mb-1 mt-4 text-[16px] font-bold tracking-[-0.448px] text-ink first:mt-0">
            {ln}
          </p>
        ) : (
          <p key={i} className="mb-1 text-[14px] leading-[25.2px] tracking-[-0.195px] text-ink/70">
            {ln}
          </p>
        ),
      )}
    </>
  );
}
