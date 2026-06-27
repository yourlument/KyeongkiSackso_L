"use client";

import type { NotificationType } from "@prisma/client";

export type NotiItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  link: string | null;
};

const TYPE_STYLE: Record<NotificationType, { icon: string; circleBg: string }> = {
  QUOTE_RESPONSE: { icon: "/icons/noti-quote.svg", circleBg: "#eff6ff" },
  BOARD_REPLY: { icon: "/icons/noti-board.svg", circleBg: "#fffbeb" },
  INFO_COMMENT: { icon: "/icons/noti-info.svg", circleBg: "#ecfdf5" },
  QUOTE_AWARDED: { icon: "/icons/noti-select.svg", circleBg: "#fef2f2" },
  ORDER_STATUS: { icon: "/icons/noti-order.svg", circleBg: "#faf5ff" },
  CHAT: { icon: "/icons/noti-chat.svg", circleBg: "#eef2ff" },
  SYSTEM: { icon: "/icons/noti-system.svg", circleBg: "#f9fafb" },
};

export function NotificationPopup({
  items,
  onReadAll,
  onItemClick,
  onOpenSettings,
}: {
  items: NotiItem[];
  onReadAll: () => void;
  onItemClick: (item: NotiItem) => void;
  onOpenSettings: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="알림"
      className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-[390px] flex-col overflow-hidden rounded-[9.76px] border border-[#e5e7eb] bg-white shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center justify-between border-b border-[#f3f4f6] px-[19.52px] pt-[14.64px] pb-[15.64px]">
        <span className="text-[17.08px] font-semibold leading-[24.4px] tracking-[-0.256px] text-[#111827]">
          알림
        </span>
        <button
          type="button"
          onClick={onReadAll}
          className="text-[14.64px] font-normal leading-[19.52px] tracking-[-0.293px] text-[#6b7280] transition-colors hover:text-[#111827]"
        >
          모두 읽음
        </button>
      </div>

      <ul className="max-h-[390px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <li className="px-[19.52px] pt-[40px] pb-[40px] text-center text-[13px] font-normal leading-[20px] tracking-[-0.195px] text-[#9ca3af]">
            새로운 알림이 없습니다
          </li>
        ) : (
          items.map((n) => {
            const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.SYSTEM;
            return (
              <li
                key={n.id}
                onClick={() => onItemClick(n)}
                className="flex cursor-pointer gap-[14.64px] border-b border-[#f9fafb] px-[19.52px] pt-[14.64px] pb-[15.64px]"
                style={n.unread ? { backgroundColor: "rgba(249,250,251,0.5)" } : undefined}
              >
                <span
                  className="mt-[2.44px] flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: style.circleBg }}
                >
                  <img src={style.icon} alt="" aria-hidden="true" className="h-[15px] w-[15px]" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className="text-[14.64px] font-medium leading-[20px] tracking-[-0.22px]"
                    style={{ color: n.unread ? "#111827" : "#4b5563" }}
                  >
                    {n.title}
                  </span>
                  <span className="mt-[2px] text-[11px] font-normal leading-[20px] tracking-[-0.165px] text-[#9ca3af]">
                    {n.body}
                  </span>
                  <span className="mt-[3px] text-[10px] font-normal leading-[18px] tracking-[-0.15px] text-[#d1d5db]">
                    {n.date}
                  </span>
                </div>

                {n.unread && (
                  <span className="mt-[7.32px] h-[10px] w-[10px] shrink-0 rounded-full bg-[#f87171]" />
                )}
              </li>
            );
          })
        )}
      </ul>

      <div className="flex items-center justify-center border-t border-[#f3f4f6] px-[19.52px] pt-[13.2px] pb-[12.2px]">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-[4.88px] text-[14.64px] font-medium leading-[19.52px] tracking-[-0.293px] text-[#1e3a5f]"
        >
          <img src="/icons/noti-settings.svg" alt="" aria-hidden="true" className="h-[11px] w-[11px]" />
          알림 설정
        </button>
      </div>
    </div>
  );
}
