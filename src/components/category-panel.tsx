"use client";

import { useState } from "react";

type SubItem = { name: string; type: "물품" | "서비스" };
type SubCategory = { name: string; count: number; items: SubItem[]; open: boolean };
type Category = { name: string; subs: SubCategory[] | null };

const CATEGORIES: Category[] = [
  {
    name: "도로교통 및 토목 분야",
    subs: [
      {
        name: "도로 건설 및 유지보수",
        count: 9,
        open: true,
        items: [
          { name: "도로포장재(레미콘, 아스콘, 시멘트, 콘크리트)", type: "물품" },
          { name: "도로용 도료(차선도색용 페인트)", type: "물품" },
          { name: "그레이팅", type: "물품" },
          { name: "맨홀", type: "물품" },
          { name: "토목용보강재", type: "물품" },
          { name: "석재", type: "물품" },
          { name: "토목자재", type: "물품" },
          { name: "도로 보수 공사 서비스", type: "서비스" },
          { name: "유지보수 대행 서비스", type: "서비스" },
        ],
      },
      { name: "교통 안전 및 관제", count: 6, open: false, items: [] },
      { name: "운송 및 특수 차량", count: 8, open: false, items: [] },
    ],
  },
  { name: "건축시설 및 전기/설비 분야", subs: null },
  { name: "일반행정 및 교육/지원 분야", subs: null },
  { name: "재난안전 및 소방/보건 분야", subs: null },
  { name: "정보통신 및 디지털/4차산업 분야", subs: null },
  { name: "환경/산림 및 조경/청소 분야", subs: null },
  { name: "복지/식품 및 문화/관광 분야", subs: null },
];

export function CategoryPanel() {

  const [selected, setSelected] = useState<number | null>(null);

  const cat = selected !== null ? CATEGORIES[selected] : null;
  const hasData = cat?.subs != null;

  return (

    <div className="flex flex-col gap-[24.4px] lg:flex-row">

      <div
        className="w-full overflow-hidden rounded-[19.52px] p-px lg:w-[254px]"
        style={{ border: "1px solid rgba(210,210,215,0.2)" }}
      >
        {CATEGORIES.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setSelected(i)}
            className="block w-full text-left transition-colors"
            style={{
              height: "60px",
              padding: "17.08px 19.52px 18.08px",
              fontSize: "14px",
              lineHeight: "24.5px",
              letterSpacing: "-0.293px",
              fontWeight: selected === i ? 600 : 400,
              color: selected === i ? "#ffffff" : "rgba(29,29,31,0.7)",
              background: selected === i ? "#1E3A5F" : "#ffffff",
              borderBottom:
                i < CATEGORIES.length - 1 ? "1px solid rgba(210,210,215,0.15)" : "none",
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div
        className="flex-1 bg-white"
        style={{
          borderRadius: "19.52px",
          border: "1px solid rgba(210,210,215,0.2)",
          padding: hasData ? "30.28px" : "49.8px",
          minHeight: hasData ? "385px" : "200px",
        }}
      >
        {cat && cat.subs ? (

          <div>

            <p
              className="mb-[24.4px]"
              style={{
                fontSize: "17px",
                fontWeight: 600,
                lineHeight: "21.2px",
                letterSpacing: "-0.48px",
                color: "#1D1D1F",
              }}
            >
              {cat.name}
            </p>

            <div className="flex flex-col">
              {cat.subs.map((sub, si) => (
                <div
                  key={sub.name}
                  style={{ paddingTop: si > 0 ? "19.5px" : 0 }}
                >

                  <div
                    className="flex items-center"
                    style={{ gap: "9.8px", marginBottom: sub.open ? "9.76px" : 0 }}
                  >

                    <img
                      src={sub.open ? "/icons/land-subcat-open.svg" : "/icons/land-subcat-closed.svg"}
                      alt=""
                      aria-hidden="true"
                      width={18}
                      height={18}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "24.5px",
                        letterSpacing: "-0.29px",
                        color: "#1D1D1F",
                      }}
                    >
                      {sub.name}
                    </span>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "21.6px",
                        letterSpacing: "-0.18px",
                        color: "rgba(29,29,31,0.4)",
                      }}
                    >
                      ({sub.count}개)
                    </span>
                  </div>

                  {sub.open && sub.items.length > 0 && (
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: "7.32px",
                        paddingLeft: "29.28px",

                        paddingTop: "9.76px",
                      }}
                    >
                      {sub.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center"
                          style={{
                            borderRadius: "14.64px",
                            padding: "9.76px 14.64px",
                            gap: "9.76px",

                            width: "100%",
                          }}
                        >

                          <span
                            style={{
                              display: "block",
                              width: "4.88px",
                              height: "4.88px",
                              borderRadius: "9999px",
                              background: "rgba(30,58,95,0.4)",
                              flexShrink: 0,
                            }}
                          />

                          <span
                            className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
                            style={{
                              fontSize: "13px",
                              fontWeight: 400,
                              lineHeight: "23.4px",
                              letterSpacing: "-0.19px",
                              color: "rgba(29,29,31,0.7)",
                            }}
                          >
                            {item.name}
                          </span>

                          <span
                            style={{
                              background: "rgba(29,29,31,0.05)",
                              borderRadius: "7.32px",
                              padding: "2.44px 7.32px",
                              fontSize: "11px",
                              fontWeight: 400,
                              lineHeight: "19.8px",
                              letterSpacing: "-0.165px",
                              color: "rgba(29,29,31,0.5)",
                              flexShrink: 0,
                            }}
                          >
                            {item.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (

          <div className="flex h-full flex-col items-center justify-center text-center">
            <span
              className="mb-[14.64px] flex items-center justify-center rounded-full"
              style={{
                width: "59px",
                height: "59px",
                background: "rgba(29,29,31,0.05)",
              }}
            >

              <img
                src="/icons/land-cat-empty.svg"
                alt=""
                aria-hidden="true"
                width={26}
                height={25}
              />
            </span>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 400,
                lineHeight: "27px",
                letterSpacing: "-0.225px",
                color: "rgba(29,29,31,0.5)",
              }}
            >
              왼쪽 대분류를 선택하면 세부 카테고리를 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
