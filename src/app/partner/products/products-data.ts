export type ProductType = "물품" | "용역";

export type ProductRow = {
  code: string;
  name: string;
  category: string;
  type: ProductType;
  price: string;
  minQty: string;
  rating: string;
  reviews: string;
  image: string;
};

export const PRODUCTS: ProductRow[] = [
  {
    code: "43201501",
    name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    category: "컴퓨터/노트북/태블릿",
    type: "물품",
    price: "890,000원",
    minQty: "1대",
    rating: "4.9",
    reviews: "(456건)",
    image: "/products/p-43201501.png",
  },
  {
    code: "43201502",
    name: "업무용 노트북 i5/8GB/256GB 15.6인치",
    category: "컴퓨터/노트북/태블릿",
    type: "물품",
    price: "650,000원",
    minQty: "1대",
    rating: "4.7",
    reviews: "(234건)",
    image: "/products/p-43201502.png",
  },
  {
    code: "43401301",
    name: "네트워크장비(스위치) 48포트 L3 관리형",
    category: "네트워크 장비",
    type: "물품",
    price: "1,200,000원",
    minQty: "1대",
    rating: "4.8",
    reviews: "(189건)",
    image: "/products/p-43401301.png",
  },
  {
    code: "43211501",
    name: "모니터 27인치 QHD IPS 광시야각 75Hz",
    category: "컴퓨터/노트북/태블릿",
    type: "물품",
    price: "320,000원",
    minQty: "1대",
    rating: "4.6",
    reviews: "(312건)",
    image: "/products/p-43211501.png",
  },
];

export const COLUMNS = ["물품번호", "품명", "카테고리", "유형", "가격", "최소수량", "평점", ""] as const;

export const CATEGORY_LEVELS = ["대분류", "중분류", "소분류"] as const;

export const CERT_MARKS = [
  "여성기업",
  "장애인기업",
  "사회적기업",
  "우수제품",
  "창업기업",
  "ISO",
  "녹색기업",
  "특허보유",
] as const;

export const DELIVERY_TERMS = ["상차도", "하차도"] as const;

export const SPEC_FIELDS = ["용도", "규격", "재질", "색상"] as const;

export type NaraResult = {
  name: string;
  spec: string;
  code: string;
  category: string;
};

export const NARA_RESULTS: NaraResult[] = [
  {
    name: "레미콘(혼합콘크리트) 24-40-140(중기)",
    spec: "강도 24MPa, 최대입자경 25mm",
    code: "12203515",
    category: "도로교통·토목",
  },
  {
    name: "교통안전용품(콘) 반사원형콘 750mm",
    spec: "PVC, 750mm, 고휘도반사시트",
    code: "39107101",
    category: "교통안전",
  },
  {
    name: "아스콘(노상용) 표준배합 15-40",
    spec: "노상용, 표준배합, 최대입자경 13mm",
    code: "45501301",
    category: "도로교통·토목",
  },
];
