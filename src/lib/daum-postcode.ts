const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: DaumPostcodeResult) => void;
        width?: string | number;
        height?: string | number;
      }) => { open: () => void; embed: (el: HTMLElement) => void };
    };
  }
}

export interface DaumPostcodeResult {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName?: string;
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("postcode load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("postcode load failed"));
    document.body.appendChild(s);
  });
}

export async function openPostcode(): Promise<DaumPostcodeResult> {
  await loadScript();
  return new Promise((resolve) => {
    new window.daum!.Postcode({
      oncomplete: (data) => resolve(data),
    }).open();
  });
}

export async function embedPostcode(
  el: HTMLElement,
  oncomplete: (data: DaumPostcodeResult) => void,
): Promise<void> {
  await loadScript();
  new window.daum!.Postcode({
    oncomplete,
    width: "100%",
    height: "100%",
  }).embed(el);
}
