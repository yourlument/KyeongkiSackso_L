"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-[39px] w-[39px] items-center justify-center rounded-full text-[12px] font-bold ${
                  done || active ? "bg-navy text-white" : "bg-line/30 text-ink/30"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] leading-[18px] tracking-[-0.15px] ${
                  done || active ? "font-medium text-navy" : "text-ink/30"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 mb-5 h-0.5 w-[39px] ${done ? "bg-navy" : "bg-line/30"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-[7.32px] block text-[12px] font-medium leading-[22px] tracking-[-0.18px] text-ink/50">
        {label} {required && <span className="text-ink/50">*</span>}
        {hint && <span className="ml-1 text-[11px] font-normal text-ink/40">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full rounded-[14.64px] border border-line/50 bg-surface px-[20.52px] py-[15.6px] text-[14px] leading-[24px] tracking-[-0.2928px] text-ink outline-none placeholder:font-medium placeholder:text-ink/30 focus:border-navy";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`${inputCls} pr-11`} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "숨기기" : "표시"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-sub hover:text-ink"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
