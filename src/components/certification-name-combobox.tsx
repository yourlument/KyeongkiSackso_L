"use client";

import { useId, useRef, useState } from "react";
import { relatedCertificationNameOptions } from "@/lib/certification-options";

const INK = "#1D1D1F";

export function CertificationNameCombobox({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const matches = relatedCertificationNameOptions(options, value);
  const directInputIndex = matches.length;

  function selectOption(option: string) {
    onChange(option);
    setOpen(false);
    setActiveIndex(-1);
  }

  function keepDirectInput() {
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <div
      style={{ position: "relative" }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="인증서명"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={value}
        placeholder="인증서명"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, directInputIndex));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => (current <= 0 ? directInputIndex : current - 1));
          } else if (event.key === "Enter" && open && activeIndex >= 0) {
            event.preventDefault();
            if (activeIndex === directInputIndex) keepDirectInput();
            else selectOption(matches[activeIndex]);
          } else if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        style={{
          width: "100%",
          height: "49.12px",
          padding: "0 39px 0 15.64px",
          borderRadius: "14.64px",
          background: "#FFFFFF",
          border: "1px solid rgba(210,210,215,0.3)",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "-0.2928px",
          lineHeight: "22.75px",
          color: INK,
          WebkitTextFillColor: INK,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        aria-label="인증서명 목록"
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setOpen((current) => !current);
          inputRef.current?.focus();
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "39px",
          height: "49.12px",
          padding: 0,
          border: 0,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: INK,
          cursor: "pointer",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 80,
            top: "calc(100% + 4.88px)",
            left: 0,
            right: 0,
            maxHeight: "219.6px",
            overflowY: "auto",
            padding: "4.88px",
            borderRadius: "14.64px",
            background: "#FFFFFF",
            border: "1px solid rgba(210,210,215,0.3)",
            boxShadow: "0 9.76px 24.4px rgba(29,29,31,0.12)",
          }}
        >
          {matches.map((option, index) => (
            <button
              id={`${listboxId}-${index}`}
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              style={{
                width: "100%",
                minHeight: "31.72px",
                padding: "4.88px 9.76px",
                border: 0,
                borderRadius: "7.32px",
                background: activeIndex === index ? "rgba(30,58,95,0.08)" : "transparent",
                color: INK,
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {option}
            </button>
          ))}
          <button
            id={`${listboxId}-${directInputIndex}`}
            type="button"
            role="option"
            aria-selected={matches.length === 0}
            onMouseEnter={() => setActiveIndex(directInputIndex)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={keepDirectInput}
            style={{
              width: "100%",
              minHeight: "31.72px",
              padding: "4.88px 9.76px",
              border: 0,
              borderRadius: "7.32px",
              background: activeIndex === directInputIndex ? "rgba(30,58,95,0.08)" : "transparent",
              color: INK,
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "-0.2928px",
              lineHeight: "22.75px",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            직접입력
          </button>
        </div>
      )}
    </div>
  );
}
