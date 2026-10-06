"use client";

export type NicepayBrowserPayload = {
  scriptUrl: string;
  testMode: boolean;
  fields: Record<string, string> & { ReturnURL: string };
};

type NicepayWindow = Window & {
  goPay?: (form: HTMLFormElement) => void;
  nicepaySubmit?: () => void;
  nicepayClose?: () => void;
};

export class NicepayWindowClosedError extends Error {
  constructor() {
    super("결제창이 닫혔습니다.");
    this.name = "NicepayWindowClosedError";
  }
}

export function createBrowserUuid(): string {
  if (typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function loadNicepayScript(src: string): Promise<void> {
  const target = window as NicepayWindow;
  if (typeof target.goPay === "function") return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-korlink-nicepay="true"]',
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("NICEPAY 결제창을 불러오지 못했습니다.")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.korlinkNicepay = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("NICEPAY 결제창을 불러오지 못했습니다.")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

export async function openNicepayPayment(
  payment: NicepayBrowserPayload,
): Promise<never> {
  await loadNicepayScript(payment.scriptUrl);
  const target = window as NicepayWindow;
  if (typeof target.goPay !== "function") {
    throw new Error("NICEPAY 결제 모듈이 준비되지 않았습니다.");
  }

  return new Promise<never>((_resolve, reject) => {
    const form = document.createElement("form");
    form.name = `nicepay-${Date.now()}`;
    form.method = "post";
    form.action = payment.fields.ReturnURL;
    form.acceptCharset = "euc-kr";
    form.style.display = "none";

    for (const [name, value] of Object.entries(payment.fields)) {
      const field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      field.value = value;
      form.appendChild(field);
    }
    document.body.appendChild(form);

    const cleanup = () => {
      form.remove();
      delete target.nicepaySubmit;
      delete target.nicepayClose;
    };
    target.nicepaySubmit = () => {
      form.submit();
    };
    target.nicepayClose = () => {
      cleanup();
      reject(new NicepayWindowClosedError());
    };

    try {
      target.goPay?.(form);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
