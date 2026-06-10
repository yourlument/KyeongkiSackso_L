import { ChatBubbleIcon } from "@/components/icons";

const KAKAO_CHANNEL_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? "#";

export function KakaoChat() {
  return (
    <a
      href={KAKAO_CHANNEL_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-7 right-7 z-50 flex items-center gap-2 rounded-full bg-kakao px-5 py-3.5 text-[14.64px] font-semibold tracking-[-0.22px] text-kakao-fg shadow-md transition-transform hover:scale-[1.03]"
    >
      <ChatBubbleIcon />
      카카오톡 상담
    </a>
  );
}
