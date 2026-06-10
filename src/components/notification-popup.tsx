"use client";

type Noti = {
  icon: string;
  circleBg: string;
  type: string;
  message: string;
  date: string;
  unread: boolean;
};

const NOTIFICATIONS: Noti[] = [
  {
    icon: "/icons/noti-quote.svg",
    circleBg: "#eff6ff",
    type: "견적요청 답변",
    message: "'화성시청 IT장비 신규 구축'에 디지털솔루션(주)가 견적을 제출했습니다.",
    date: "2026-05-07 14:30",
    unread: true,
  },
  {
    icon: "/icons/noti-board.svg",
    circleBg: "#fffbeb",
    type: "수요 게시판 답변",
    message: "'무인 냉장고 임대' 수요 게시에 경기냉동이 답변을 달았습니다.",
    date: "2026-05-07 11:20",
    unread: true,
  },
  {
    icon: "/icons/noti-info.svg",
    circleBg: "#ecfdf5",
    type: "정보 공유 답글",
    message: "'나라장터 물품식별번호 조회 팁'에 박주임이 댓글을 달았습니다.",
    date: "2026-05-06 16:45",
    unread: true,
  },
  {
    icon: "/icons/noti-select.svg",
    circleBg: "#fef2f2",
    type: "견적 선정 결과",
    message: "'화성시 소방서 장비 보강' 견적에 안전소방(주)이 선정되었습니다.",
    date: "2026-05-05 09:00",
    unread: false,
  },
  {
    icon: "/icons/noti-order.svg",
    circleBg: "#faf5ff",
    type: "주문 상태 변경",
    message: "'업무용 PC 5대' 주문이 배송완료 처리되었습니다.",
    date: "2026-05-04 18:00",
    unread: false,
  },
  {
    icon: "/icons/noti-system.svg",
    circleBg: "#f9fafb",
    type: "시스템 알림",
    message: "KORLINK 플랫폼 서비스 이용약관이 5월 15일부터 변경됩니다.",
    date: "2026-05-03 10:00",
    unread: false,
  },
  {
    icon: "/icons/noti-quote2.svg",
    circleBg: "#eff6ff",
    type: "견적요청 답변",
    message: "'도로보수 자재'에 경기건설(주)가 견적을 제출했습니다.",
    date: "2026-05-02 13:15",
    unread: false,
  },
];

export function NotificationPopup() {
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
          className="text-[14.64px] font-normal leading-[19.52px] tracking-[-0.293px] text-[#6b7280] transition-colors hover:text-[#111827]"
        >
          모두 읽음
        </button>
      </div>

      <ul className="max-h-[390px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NOTIFICATIONS.map((n, i) => (
          <li
            key={i}
            className="flex gap-[14.64px] border-b border-[#f9fafb] px-[19.52px] pt-[14.64px] pb-[15.64px]"
            style={n.unread ? { backgroundColor: "rgba(249,250,251,0.5)" } : undefined}
          >

            <span
              className="mt-[2.44px] flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: n.circleBg }}
            >

              <img src={n.icon} alt="" aria-hidden="true" className="h-[15px] w-[15px]" />
            </span>

            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className="text-[14.64px] font-medium leading-[20px] tracking-[-0.22px]"
                style={{ color: n.unread ? "#111827" : "#4b5563" }}
              >
                {n.type}
              </span>
              <span className="mt-[2px] text-[11px] font-normal leading-[20px] tracking-[-0.165px] text-[#9ca3af]">
                {n.message}
              </span>
              <span className="mt-[3px] text-[10px] font-normal leading-[18px] tracking-[-0.15px] text-[#d1d5db]">
                {n.date}
              </span>
            </div>

            {n.unread && (
              <span className="mt-[7.32px] h-[10px] w-[10px] shrink-0 rounded-full bg-[#f87171]" />
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center border-t border-[#f3f4f6] px-[19.52px] pt-[13.2px] pb-[12.2px]">
        <button
          type="button"
          className="flex items-center gap-[4.88px] text-[14.64px] font-medium leading-[19.52px] tracking-[-0.293px] text-[#1e3a5f]"
        >

          <img src="/icons/noti-settings.svg" alt="" aria-hidden="true" className="h-[11px] w-[11px]" />
          알림 설정
        </button>
      </div>
    </div>
  );
}
