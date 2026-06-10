"use client";

import { useEffect, useRef, useState } from "react";

const PLACEHOLDER =
  "필요한 물품/서비스에 대해 상세히 설명해주세요. 이미지를 드래그하거나 붙여넣기할 수 있습니다.";

const TOOLBAR_CSS = `
.krte { border-radius: 14.64px; background: #fff; overflow: hidden; }
.krte-toolbar { display: flex; align-items: center; flex-wrap: wrap; padding: 8px 12px; border-bottom: 1px solid rgba(210,210,215,0.4); background: #fff; box-sizing: border-box; }
.krte-group { display: inline-flex; align-items: center; margin-right: 12px; }
.krte-group:last-child { margin-right: 0; }
.krte-btn { width: 28px; height: 24px; padding: 3px 5px; background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; }
.krte-btn svg { width: 18px; height: 18px; }
.krte .ql-stroke { fill: none; stroke: #444; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
.krte .ql-thin, .krte .ql-stroke.ql-thin { stroke-width: 1; }
.krte .ql-fill, .krte .ql-stroke.ql-fill { fill: #444; }
.krte .ql-even { fill-rule: evenodd; }
.krte .ql-transparent { opacity: 0.4; }
.krte-btn:hover .ql-stroke, .krte-btn.krte-on .ql-stroke { stroke: #06c; }
.krte-btn:hover .ql-fill, .krte-btn.krte-on .ql-fill { fill: #06c; }
.krte-btn:hover .ql-stroke.ql-fill, .krte-btn.krte-on .ql-stroke.ql-fill { fill: #06c; }
.krte-selwrap { position: relative; display: inline-flex; align-items: center; height: 24px; }
.krte-select { appearance: none; -webkit-appearance: none; border: none; background: transparent; font-family: inherit; font-size: 14px; color: #444; height: 24px; line-height: 24px; padding: 0 20px 0 5px; cursor: pointer; outline: none; }
.krte-selwrap svg { position: absolute; right: 0; top: 50%; transform: translateY(-50%); pointer-events: none; width: 18px; height: 18px; }
.krte-wrap { position: relative; }
.krte-content { padding: 15.625px 20.52px; min-height: 449px; font-size: 14px; font-weight: 400; line-height: 24.5px; letter-spacing: -0.2928px; color: #1D1D1F; outline: none; box-sizing: border-box; overflow-wrap: break-word; word-break: break-word; }
.krte-content img { max-width: 100%; height: auto; }
.krte-content h1 { font-size: 2em; font-weight: 700; margin: 0.4em 0; }
.krte-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.4em 0; }
.krte-content h3 { font-size: 1.17em; font-weight: 700; margin: 0.4em 0; }
.krte-content ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
.krte-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
.krte-content a { color: #0071E3; text-decoration: underline; }
.krte-content blockquote { border-left: 4px solid #D2D2D7; padding-left: 1em; margin: 0.4em 0; }
.krte-ph { position: absolute; top: 15.625px; left: 20.52px; right: 20.52px; font-size: 14px; line-height: 24.5px; letter-spacing: -0.2928px; color: rgba(29,29,31,0.3); font-style: italic; pointer-events: none; }
`;

const BoldIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <path className="ql-stroke" d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z" />
    <path className="ql-stroke" d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z" />
  </svg>
);
const ItalicIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="7" x2="13" y1="4" y2="4" />
    <line className="ql-stroke" x1="5" x2="11" y1="14" y2="14" />
    <line className="ql-stroke" x1="8" x2="10" y1="14" y2="4" />
  </svg>
);
const UnderlineIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <path className="ql-stroke" d="M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3" />
    <rect className="ql-fill" height="1" rx="0.5" ry="0.5" width="12" x="3" y="15" />
  </svg>
);
const StrikeIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke ql-thin" x1="15.5" x2="2.5" y1="8.5" y2="9.5" />
    <path className="ql-fill" d="M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z" />
    <path className="ql-fill" d="M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z" />
  </svg>
);
const OrderedIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="7" x2="15" y1="4" y2="4" />
    <line className="ql-stroke" x1="7" x2="15" y1="9" y2="9" />
    <line className="ql-stroke" x1="7" x2="15" y1="14" y2="14" />
    <line className="ql-stroke ql-thin" x1="2.5" x2="4.5" y1="5.5" y2="5.5" />
    <path className="ql-fill" d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z" />
    <path className="ql-stroke ql-thin" d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156" />
    <path className="ql-stroke ql-thin" d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109" />
  </svg>
);
const BulletIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="6" x2="15" y1="4" y2="4" />
    <line className="ql-stroke" x1="6" x2="15" y1="9" y2="9" />
    <line className="ql-stroke" x1="6" x2="15" y1="14" y2="14" />
    <line className="ql-stroke" x1="3" x2="3" y1="4" y2="4" />
    <line className="ql-stroke" x1="3" x2="3" y1="9" y2="9" />
    <line className="ql-stroke" x1="3" x2="3" y1="14" y2="14" />
  </svg>
);
const OutdentIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="3" x2="15" y1="14" y2="14" />
    <line className="ql-stroke" x1="3" x2="15" y1="4" y2="4" />
    <line className="ql-stroke" x1="9" x2="15" y1="9" y2="9" />
    <polyline className="ql-stroke" points="5 7 5 11 3 9 5 7" />
  </svg>
);
const IndentIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="3" x2="15" y1="14" y2="14" />
    <line className="ql-stroke" x1="3" x2="15" y1="4" y2="4" />
    <line className="ql-stroke" x1="9" x2="15" y1="9" y2="9" />
    <polyline className="ql-fill ql-stroke" points="3 7 3 11 5 9 3 7" />
  </svg>
);
const ColorIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-color-label ql-stroke ql-transparent" x1="3" x2="15" y1="15" y2="15" />
    <polyline className="ql-stroke" points="5.5 11 9 3 12.5 11" />
    <line className="ql-stroke" x1="11.63" x2="6.38" y1="9" y2="9" />
  </svg>
);
const BackgroundIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <g className="ql-fill ql-color-label">
      <polygon points="6 6.868 6 6 5 6 5 7 5.942 7 6 6.868" />
      <rect height="1" width="1" x="4" y="4" />
      <polygon points="6.817 5 6 5 6 6 6.38 6 6.817 5" />
      <rect height="1" width="1" x="2" y="6" />
      <rect height="1" width="1" x="3" y="5" />
      <rect height="1" width="1" x="4" y="7" />
      <polygon points="4 11.439 4 11 3 11 3 12 3.755 12 4 11.439" />
      <rect height="1" width="1" x="2" y="12" />
      <rect height="1" width="1" x="2" y="9" />
      <rect height="1" width="1" x="2" y="15" />
      <polygon points="4.63 10 4 10 4 11 4.192 11 4.63 10" />
      <rect height="1" width="1" x="3" y="8" />
      <path d="M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z" />
      <path d="M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z" />
      <path d="M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z" />
      <rect height="1" width="1" x="12" y="2" />
      <rect height="1" width="1" x="11" y="3" />
      <path d="M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z" />
      <rect height="1" width="1" x="2" y="3" />
      <rect height="1" width="1" x="6" y="2" />
      <rect height="1" width="1" x="3" y="2" />
      <rect height="1" width="1" x="5" y="3" />
      <rect height="1" width="1" x="9" y="2" />
      <rect height="1" width="1" x="15" y="14" />
      <polygon points="13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174" />
      <rect height="1" width="1" x="13" y="7" />
      <rect height="1" width="1" x="15" y="5" />
      <rect height="1" width="1" x="14" y="6" />
      <rect height="1" width="1" x="15" y="8" />
      <rect height="1" width="1" x="14" y="9" />
      <path d="M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z" />
      <rect height="1" width="1" x="14" y="3" />
      <polygon points="12 6.868 12 6 11.62 6 12 6.868" />
      <rect height="1" width="1" x="15" y="2" />
      <rect height="1" width="1" x="12" y="5" />
      <rect height="1" width="1" x="13" y="4" />
      <polygon points="12.933 9 13 9 13 8 12.495 8 12.933 9" />
      <rect height="1" width="1" x="9" y="14" />
      <rect height="1" width="1" x="8" y="15" />
      <path d="M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z" />
      <rect height="1" width="1" x="5" y="15" />
      <path d="M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z" />
      <rect height="1" width="1" x="11" y="15" />
      <path d="M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z" />
      <rect height="1" width="1" x="14" y="15" />
      <rect height="1" width="1" x="15" y="11" />
    </g>
    <polyline className="ql-stroke" points="5.5 13 9 5 12.5 13" />
    <line className="ql-stroke" x1="11.63" x2="6.38" y1="11" y2="11" />
  </svg>
);
const LinkIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="7" x2="11" y1="7" y2="11" />
    <path className="ql-even ql-stroke" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z" />
    <path className="ql-even ql-stroke" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z" />
  </svg>
);
const ImageIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <rect className="ql-stroke" height="10" width="12" x="3" y="4" />
    <circle className="ql-fill" cx="6" cy="7" r="1" />
    <polyline className="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12" />
  </svg>
);
const CleanIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <line className="ql-stroke" x1="5" x2="13" y1="3" y2="3" />
    <line className="ql-stroke" x1="6" x2="9.35" y1="12" y2="3" />
    <line className="ql-stroke" x1="11" x2="15" y1="11" y2="15" />
    <line className="ql-stroke" x1="15" x2="11" y1="11" y2="15" />
    <rect className="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14" />
  </svg>
);

const ExpandIcon = (
  <svg viewBox="0 0 18 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <polygon className="ql-stroke" points="7 11 9 13 11 11 7 11" />
    <polygon className="ql-stroke" points="7 7 9 5 11 7 7 7" />
  </svg>
);

type ToggleCmd = "bold" | "italic" | "underline" | "strikeThrough" | "insertOrderedList" | "insertUnorderedList";

export function RichEditor({
  initialHTML = "",
  onChange,
  error = false,
}: {
  initialHTML?: string;
  onChange: (html: string) => void;
  error?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [empty, setEmpty] = useState(true);
  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const el = editorRef.current;
    if (el && initialHTML) {
      el.innerHTML = initialHTML;
      setEmpty(isEmpty(el));
    }
  }, []);

  useEffect(() => {
    function onSelChange() {
      const sel = window.getSelection();
      const el = editorRef.current;
      if (!sel || sel.rangeCount === 0 || !el) return;
      if (el.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
        setActive({
          bold: queryState("bold"),
          italic: queryState("italic"),
          underline: queryState("underline"),
          strikeThrough: queryState("strikeThrough"),
          insertOrderedList: queryState("insertOrderedList"),
          insertUnorderedList: queryState("insertUnorderedList"),
        });
      }
    }
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  function isEmpty(el: HTMLElement) {
    if (el.querySelector("img")) return false;
    return (el.textContent ?? "").trim().length === 0;
  }

  function queryState(cmd: string) {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  }

  function emit() {
    const el = editorRef.current;
    if (!el) return;
    setEmpty(isEmpty(el));
    onChange(el.innerHTML);
  }

  function restoreSelection() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  function exec(cmd: string, value?: string) {
    restoreSelection();
    document.execCommand(cmd, false, value);
    emit();
  }

  function toggle(cmd: ToggleCmd) {
    exec(cmd);
  }

  function applyHeader(value: string) {
    restoreSelection();
    document.execCommand("formatBlock", false, value === "p" ? "P" : value.toUpperCase());
    emit();
  }

  function applyColor(cmd: "foreColor" | "hiliteColor", value: string) {
    restoreSelection();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
    }
    if (cmd === "hiliteColor") {

      if (!document.execCommand("hiliteColor", false, value)) {
        document.execCommand("backColor", false, value);
      }
    } else {
      document.execCommand("foreColor", false, value);
    }
    emit();
  }

  function makeLink() {
    restoreSelection();
    const url = window.prompt("URL", "https://");
    if (url) document.execCommand("createLink", false, url);
    emit();
  }

  function insertImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      document.execCommand("insertHTML", false, `<img src="${reader.result}" alt="" />`);
      emit();
    };
    reader.readAsDataURL(file);
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of Array.from(items)) {
      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          e.preventDefault();
          insertImageFile(file);
        }
      }
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    e.preventDefault();

    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    const r = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (r) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
      savedRange.current = r.cloneRange();
    }
    imgs.forEach(insertImageFile);
  }

  const btn = (
    onClick: () => void,
    icon: React.ReactNode,
    key: string,
    activeKey?: string,
  ) => (
    <button
      key={key}
      type="button"
      className={`krte-btn${activeKey && active[activeKey] ? " krte-on" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <div
      className="krte"
      style={{ border: error ? "1px solid #F87171" : "1px solid rgba(210,210,215,0.4)" }}
    >
      <style>{TOOLBAR_CSS}</style>

      <div className="krte-toolbar">

        <span className="krte-group">
          <span className="krte-selwrap">

            <select
              className="krte-select"
              defaultValue="p"
              onChange={(e) => applyHeader(e.target.value)}
            >
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            {ExpandIcon}
          </span>
        </span>

        <span className="krte-group">
          {btn(() => toggle("bold"), BoldIcon, "b", "bold")}
          {btn(() => toggle("italic"), ItalicIcon, "i", "italic")}
          {btn(() => toggle("underline"), UnderlineIcon, "u", "underline")}
          {btn(() => toggle("strikeThrough"), StrikeIcon, "s", "strikeThrough")}
        </span>

        <span className="krte-group">
          {btn(() => toggle("insertOrderedList"), OrderedIcon, "ol", "insertOrderedList")}
          {btn(() => toggle("insertUnorderedList"), BulletIcon, "ul", "insertUnorderedList")}
        </span>

        <span className="krte-group">
          {btn(() => exec("outdent"), OutdentIcon, "outdent")}
          {btn(() => exec("indent"), IndentIcon, "indent")}
        </span>

        <span className="krte-group">
          {btn(() => colorRef.current?.click(), ColorIcon, "color")}
          {btn(() => bgRef.current?.click(), BackgroundIcon, "bg")}
        </span>

        <span className="krte-group">
          {btn(makeLink, LinkIcon, "link")}
          {btn(() => imageRef.current?.click(), ImageIcon, "image")}
        </span>

        <span className="krte-group">{btn(() => exec("removeFormat"), CleanIcon, "clean")}</span>
      </div>

      <div className="krte-wrap">
        <div
          ref={editorRef}
          className="krte-content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onBlur={emit}
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        />
        {empty && <div className="krte-ph">{PLACEHOLDER}</div>}
      </div>

      <input
        ref={colorRef}
        type="color"
        hidden
        onChange={(e) => applyColor("foreColor", e.target.value)}
      />
      <input
        ref={bgRef}
        type="color"
        hidden
        onChange={(e) => applyColor("hiliteColor", e.target.value)}
      />
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) insertImageFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
