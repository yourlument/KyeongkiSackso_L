
export type Category =
  | "실무자 놀이터"
  | "업체후기"
  | "구매/용역 정보"
  | "서식/자료 공유"
  | "감사 대응/사례"
  | "민원 대응/사례"
  | "긴급 공유";

export const CATEGORIES: Category[] = [
  "실무자 놀이터",
  "업체후기",
  "구매/용역 정보",
  "서식/자료 공유",
  "감사 대응/사례",
  "민원 대응/사례",
  "긴급 공유",
];

export const CATEGORY_DESC: Record<Category, string> = {
  "실무자 놀이터": "행복하고 재미있고 힘들고, 화나고, 피곤하고, 지겨울때 무엇이든 말하고 소통해요",
  "업체후기": "업체정보, 추천, 거래사례 공유해요",
  "구매/용역 정보": "물품구매, 용역관련 정보공유해요",
  "서식/자료 공유": "업무관련 서류/자료 정보 무엇이든 공유해요",
  "감사 대응/사례": "이거 감사 걸릴까요? 지적사례, 예방/대응법 공유해요",
  "민원 대응/사례": "각종민원 대응 노하우, 애로사항 공유해요",
  "긴급 공유": "정부정책, 시스템장애, 천재지변, 각종 비상사태 등 실시간 이슈를 공유해요",
};

export type Post = {
  id: number;
  category: Category;
  date: string;
  title: string;
  excerpt: string;
  author: string;
  comments: number;
  views: number;
  likes: number;
  dislikes: number;
  mine?: boolean;
};

export type HotPost = {
  rank: number;
  title: string;
  comments: number;
  attachments: number;
  author: string;
  date: string;
  likes: number;
  views: number;
};

