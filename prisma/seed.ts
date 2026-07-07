import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encField, encryptLookup } from "../src/lib/crypto/pii";
import { CATEGORY_TAXONOMY, topCode, midCode, leafCode } from "../src/lib/categories";

import type { SeedCtx } from "./seed/types";
import { seedMembers } from "./seed/members";
import { seedSupplierProfile } from "./seed/supplier-profile";
import { seedQuotes } from "./seed/quotes";
import { seedChats } from "./seed/chats";
import { seedOrders } from "./seed/orders";
import { seedSubscriptions } from "./seed/subscriptions";
import { seedCommunity } from "./seed/community";
import { seedInfo } from "./seed/info";
import { seedNews } from "./seed/news";
import { seedClaims } from "./seed/claims";
import { seedNotifications } from "./seed/notifications";
import { seedReviews } from "./seed/reviews";
import { seedNara } from "./seed/nara";
import { seedPartnerProducts } from "./seed/partner-products";

const prisma = new PrismaClient();

function toTermHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const out: string[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      out.push("<ul>" + bullets.map((b) => `<li>${esc(b)}</li>`).join("") + "</ul>");
      bullets = [];
    }
  };
  for (const raw of text.split("\n")) {
    const ln = raw.trim();
    if (!ln) {
      flush();
      continue;
    }
    if (ln.startsWith("· ")) {
      bullets.push(ln.slice(2));
      continue;
    }
    flush();
    out.push(/^제\d+조/.test(ln) ? `<h3>${esc(ln)}</h3>` : `<p>${esc(ln)}</p>`);
  }
  flush();
  return out.join("");
}

async function main() {
  const pw = await bcrypt.hash("Test1234!", 10);

  const SERVICE_FULL = [
    "제1조 (목적)",
    '본 약관은 (주)KORLINK(이하 "회사")가 제공하는 공공조달 플랫폼 KORLINK(이하 "서비스")의 이용조건 및 절차, 회원과 회사 간의 권리·의무·책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.',
    "제2조 (용어의 정의)",
    '① "서비스"란 회사가 제공하는 지자체 공공조달 중계 플랫폼 및 관련 제반 서비스를 의미합니다.',
    '② "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 말하며, 공무원/구매담당자 회원과 공급업체 회원으로 구분됩니다.',
    '③ "공무원/구매담당자 회원"이란 지방자치단체 소속 공무원 또는 구매 업무 담당자로서 물품·용역 구매, 견적요청, 수요게시 등의 기능을 이용하는 회원을 말합니다.',
    '④ "공급업체 회원"이란 KORLINK 플랫폼에 입점하여 상품을 등록하고 견적을 제출하는 기업 회원을 말합니다.',
    "제3조 (회원 자격 및 구분)",
    "① 회사는 회원의 자격을 공무원/구매담당자와 공급업체로 구분하여 운영하며, 각 자격에 따라 이용 가능한 서비스가 상이합니다.",
    "② 공무원/구매담당자 회원은 소속 기관 정보 및 사업자등록번호(고유번호증)를 정확히 등록하여야 하며, 허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.",
    "③ 공급업체 회원은 사업자등록증 제출 및 관리자 승인 절차를 거쳐야 정식 이용이 가능하며, 승인 전까지 일부 기능이 제한됩니다.",
    "④ 회원은 타인의 정보를 도용하거나 이중 가입할 수 없으며, 적발 시 즉시 이용이 제한됩니다.",
    "제4조 (거래 성립 및 플랫폼의 역할)",
    "① 본 서비스에서의 모든 거래는 회원 간 직접 체결되는 것을 원칙으로 하며, 회사는 거래 당사자가 아닌 중개 플랫폼 제공자입니다.",
    "② 거래의 성립은 구매자가 발주(또는 결제)를 완료하고 공급자가 이를 수락한 시점을 기준으로 합니다.",
    "③ 회사는 등록된 상품의 품질, 규격, 납품 시기 등에 대해 보증하지 않으며, 이에 대한 책임은 해당 상품을 등록한 공급업체 회원에게 있습니다.",
    "제5조 (플랫폼의 면책)",
    "① 회사는 회원 간 거래에서 발생하는 분쟁(대금 미지급, 납품 지연, 하자 등)에 대해 개입 의무가 없으며, 이에 대한 법적 책임을 지지 않습니다.",
    "② 회사는 천재지변, 통신 장애, 정부 규제 등 불가항력으로 인한 서비스 일시 중단에 대해 책임을 지지 않습니다.",
    "③ 회원이 게시한 콘텐츠(상품 정보, 견적 내용 등)의 정확성과 적법성은 게시자 본인에게 책임이 있습니다.",
    "제6조 (금지행위)",
    "회원은 다음 각 호의 행위를 하여서는 안 됩니다.",
    "1. 허위 정보 등록 또는 타인 정보 도용",
    "2. 공공조달 관련 법령 위반 행위",
    "3. 담합, 입찰 방해 등 공정 경쟁을 해치는 행위",
    "4. 서비스의 정상적 운영을 방해하는 행위",
    "5. 회사 또는 제3자의 지식재산권 침해",
    "제7조 (분쟁 해결)",
    "① 서비스 이용과 관련한 분쟁은 상호 협의를 원칙으로 합니다.",
    "② 협의가 이루어지지 않을 경우, 대한민국 법령을 준거법으로 하여 회사 소재지 관할 법원에 소를 제기합니다.",
    "제8조 (회원의 의무)",
    "① 회원은 관계 법령, 본 약관 및 회사가 정한 운영정책을 준수하여야 합니다.",
    "② 회원은 가입 시 등록한 정보를 항상 정확하고 최신 상태로 유지하여야 하며, 정보 변경 시 즉시 수정하여야 합니다.",
    "③ 회원은 자신의 계정(ID) 및 비밀번호를 직접 관리하여야 하며, 이를 제3자에게 양도, 대여 또는 공유할 수 없습니다.",
    "④ 회원의 계정 관리 소홀로 발생한 손해에 대한 책임은 회원 본인에게 있습니다.",
    "제9조 (회원 자격의 제한 및 이용제한)",
    "① 회사는 다음 각 호의 어느 하나에 해당하는 경우 회원의 서비스 이용을 제한하거나 회원 자격을 정지 또는 해지할 수 있습니다.",
    "1. 허위 정보를 등록한 경우",
    "2. 타인의 정보를 도용한 경우",
    "3. 공공조달 관련 법령을 위반한 경우",
    "4. 담합, 입찰방해 등 공정한 거래질서를 해치는 경우",
    "5. 회사 또는 다른 회원의 권익을 침해한 경우",
    "6. 서비스의 정상적인 운영을 방해한 경우",
    "7. 기타 회사가 서비스 운영상 부적절하다고 판단하는 경우",
    "② 회사는 이용제한 조치를 하는 경우 그 사유를 회원에게 통지합니다. 다만 긴급한 경우에는 사후 통지할 수 있습니다.",
    "제10조 (서비스의 변경 및 중단)",
    "① 회사는 서비스의 개선, 시스템 유지보수, 정책 변경 또는 기타 운영상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.",
    "② 회사는 천재지변, 정전, 통신장애, 시스템 장애, 정부 정책 변경 등 불가항력적인 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.",
    "③ 회사는 서비스 변경 또는 중단이 필요한 경우 사전에 공지하는 것을 원칙으로 합니다. 다만 긴급한 경우에는 사후 공지할 수 있습니다.",
    "제11조 (결제 및 정산)",
    "① 회사는 플랫폼 이용에 따른 중개수수료를 부과할 수 있으며, 수수료율은 서비스 내 별도로 안내합니다.",
    "② 결제는 회사가 지정한 전자결제(PG) 시스템을 통하여 이루어질 수 있습니다.",
    "③ 공급업체에 대한 정산은 회사가 정한 정산기준 및 일정에 따라 이루어집니다.",
    "④ PG사 또는 금융기관의 시스템 장애로 인한 결제 또는 정산 지연에 대하여 회사는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.",
    "제12조 (플랫폼의 역할에 대한 특약)",
    "① 회사는 회원 간 거래를 연결하는 온라인 플랫폼을 제공할 뿐이며, 거래의 당사자가 아닙니다.",
    "② 공공기관의 구매 결정, 계약 체결 여부 및 계약 상대방 선정은 해당 기관의 고유 권한이며 회사는 이에 관여하거나 보장하지 않습니다.",
    "③ 회사는 공급업체의 상품정보, 규격, 인증, 시험성적서, 성능, 납기, 품질, 특허, 지식재산권 등에 대하여 확인하거나 보증하지 않습니다.",
    "④ 회사는 회원 간 거래의 성사 여부, 계약 체결 여부 또는 거래 규모를 보장하지 않습니다.",
    "⑤ 거래와 관련하여 발생하는 계약 불이행, 대금 지급, 납품 지연, 하자, A/S 등 모든 책임은 거래 당사자인 회원에게 있습니다.",
    "제13조 (공무원 전용 게시판 운영)",
    "① 회사는 공무원 회원을 위한 익명 커뮤니티 서비스를 운영할 수 있습니다.",
    "② 회사는 익명성을 최대한 보장하기 위하여 노력합니다.",
    "③ 다음 각 호의 게시물은 사전 통보 없이 삭제할 수 있습니다.",
    "1. 허위사실 또는 명예훼손 게시물",
    "2. 개인정보를 포함한 게시물",
    "3. 욕설, 비방, 음란 또는 혐오 표현",
    "4. 정치적·종교적 분쟁을 조장하는 게시물",
    "5. 광고 또는 영리 목적 게시물",
    "6. 관계 법령을 위반하는 게시물",
    "④ 익명 게시판이라 하더라도 관계 법령에 따른 법원, 수사기관 등 적법한 기관의 요청이 있는 경우 회사는 관련 법령에 따라 필요한 정보를 제공할 수 있습니다.",
    "제14조 (지식재산권)",
    "① 서비스 및 서비스에 포함된 디자인, 로고, 상표, 프로그램, 콘텐츠 등에 관한 저작권 및 지식재산권은 회사 또는 정당한 권리자에게 귀속됩니다.",
    "② 회원은 회사의 사전 서면 동의 없이 서비스의 일부 또는 전부를 복제, 배포, 수정하거나 영리 목적으로 사용할 수 없습니다.",
    "제15조 (손해배상)",
    "① 회사는 회사의 고의 또는 중대한 과실이 없는 한 회원에게 발생한 손해에 대하여 책임을 지지 않습니다.",
    "② 회원이 관계 법령 또는 본 약관을 위반하여 회사 또는 제3자에게 손해를 발생시킨 경우 해당 회원은 그 손해를 배상하여야 합니다.",
    "제16조 (약관의 변경)",
    "① 회사는 관계 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.",
    "② 회사는 약관을 변경하는 경우 시행일 7일 전(회원에게 불리한 변경은 30일 전)부터 서비스 내 공지사항 등을 통하여 공지합니다.",
    "③ 회원이 변경된 약관 시행일까지 명시적으로 거부 의사를 표시하지 않고 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.",
    "제17조 (기타)",
    "① 본 약관에서 정하지 아니한 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「전자문서 및 전자거래 기본법」, 「개인정보 보호법」 등 관계 법령 및 일반 상관례를 따릅니다.",
    "② 서비스 이용과 관련하여 발생한 분쟁은 상호 협의를 원칙으로 하며, 협의가 이루어지지 않을 경우 대한민국 법령을 준거법으로 하고 「민사소송법」에 따른 관할법원을 제1심 관할법원으로 합니다.",
  ].join("\n");

  const SERVICE_SUMMARY =
    "공무원(구매자)과 입점 업체(공급자)의 자격을 구분하고, 거래 성립 기준 및 플랫폼의 중개 면책 범위를 정의하는 기본 규칙입니다.";
  const PRIVACY_SUMMARY =
    "소속 기관, 부서, 연락처, 사업자번호 등 수집하는 정보를 명시하고, 공공조달 증빙 법정 보관 기간(5년)에 따른 관리 방침을 고지합니다.";
  const SUPPLIER_SUMMARY =
    "공급 업체의 대금 정산 주기, 플랫폼 이용 수수료율, 납품 지연 시 패널티 및 반품/교환 배송비 책임 소재를 명시하는 입점 계약입니다.";

  const PRIVACY_FULL = [
    "개인정보처리방침",
    '주식회사 KORLINK(이하 "회사")는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.',
    "제1조 (개인정보의 처리 목적)",
    "회사는 다음의 목적을 위하여 개인정보를 처리합니다.",
    "1. 회원가입 및 본인확인",
    "2. 공무원 회원 및 공급업체 회원 자격 확인",
    "3. 서비스 제공 및 계약의 이행",
    "4. 견적요청, 발주, 계약 및 거래 관리",
    "5. 결제 및 정산 서비스 제공",
    "6. 고객 문의 및 민원 처리",
    "7. 서비스 개선 및 통계 분석",
    "8. 법령에 따른 의무 이행",
    "9. 부정 이용 방지 및 서비스 보안",
    "제2조 (수집하는 개인정보 항목)",
    "① 공통 회원",
    "· 성명",
    "· 아이디(ID)",
    "· 비밀번호(암호화 저장)",
    "· 휴대전화번호",
    "· 이메일 주소",
    "② 공무원/구매담당자 회원",
    "· 소속기관명",
    "· 부서명",
    "· 직급(선택)",
    "· 기관 고유번호 또는 사업자등록번호(필요한 경우)",
    "③ 공급업체 회원",
    "· 회사명",
    "· 사업자등록번호",
    "· 대표자명",
    "· 사업장 주소",
    "· 담당자 성명",
    "· 담당자 연락처",
    "· 담당자 이메일",
    "· 통신판매업 신고정보(해당 시)",
    "· 사업자등록증 등 증빙자료",
    "④ 거래 시 수집 정보",
    "· 주문내역",
    "· 견적내역",
    "· 계약정보",
    "· 결제 및 정산 정보",
    "⑤ 자동으로 수집되는 정보",
    "· IP주소",
    "· 접속일시",
    "· 접속기록",
    "· 쿠키(Cookie)",
    "· 브라우저 정보",
    "· 기기 정보",
    "· 서비스 이용기록",
    "제3조 (개인정보의 처리 및 보유기간)",
    "① 회사는 개인정보 수집 목적이 달성될 때까지 개인정보를 보관합니다.",
    "② 관계 법령에 따라 다음 기간 동안 보관할 수 있습니다.",
    "보관항목 / 보관기간",
    "· 계약 또는 청약철회 기록: 5년",
    "· 대금결제 및 재화 공급 기록: 5년",
    "· 소비자 불만 및 분쟁처리 기록: 3년",
    "· 표시·광고 관련 기록: 6개월",
    "· 접속기록: 3개월",
    "③ 회원 탈퇴 시 개인정보는 즉시 파기합니다. 다만 법령상 보관 의무가 있는 정보는 해당 기간 동안 별도로 보관합니다.",
    "제4조 (개인정보의 제3자 제공)",
    "① 회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.",
    "② 다만 다음의 경우에는 예외로 합니다.",
    "1. 이용자가 사전에 동의한 경우",
    "2. 법령에 특별한 규정이 있는 경우",
    "3. 법원의 판결 또는 수사기관의 적법한 요청이 있는 경우",
    "4. 거래 이행을 위하여 필요한 범위에서 거래 상대방에게 제공하는 경우",
    "제5조 (개인정보 처리의 위탁)",
    "회사는 서비스 운영을 위하여 다음과 같이 개인정보 처리를 위탁할 수 있습니다.",
    "수탁업체 / 위탁업무",
    "· PG사: 전자결제 및 결제처리",
    "· 문자발송 업체: SMS 발송",
    "· 이메일 발송 서비스: 이메일 발송",
    "· 클라우드 서버 운영업체: 시스템 운영 및 데이터 보관",
    "※ 위탁업체가 변경되는 경우 본 방침을 통하여 공개합니다.",
    "제6조 (쿠키의 사용)",
    "① 회사는 서비스 제공을 위하여 쿠키를 사용할 수 있습니다.",
    "② 이용자는 브라우저 설정을 통하여 쿠키 저장을 거부할 수 있습니다.",
    "③ 쿠키 저장을 거부할 경우 일부 서비스 이용이 제한될 수 있습니다.",
    "제7조 (개인정보의 파기)",
    "① 회사는 개인정보 보유기간이 종료되거나 처리목적이 달성된 경우 지체 없이 개인정보를 파기합니다.",
    "② 전자적 파일은 복구가 불가능한 방법으로 삭제합니다.",
    "③ 종이 문서는 분쇄 또는 소각하여 파기합니다.",
    "제8조 (이용자의 권리)",
    "이용자는 언제든지 다음의 권리를 행사할 수 있습니다.",
    "1. 개인정보 열람 요구",
    "2. 개인정보 정정 요구",
    "3. 개인정보 삭제 요구",
    "4. 개인정보 처리정지 요구",
    "5. 회원 탈퇴",
    "회사는 관련 법령에 따라 지체 없이 필요한 조치를 합니다.",
    "제9조 (개인정보의 안전성 확보조치)",
    "회사는 개인정보 보호를 위하여 다음과 같은 조치를 시행합니다.",
    "1. 개인정보 접근 권한 최소화",
    "2. 비밀번호 암호화",
    "3. 개인정보 전송 구간 암호화(SSL 등)",
    "4. 접근기록 보관",
    "5. 보안 프로그램 운영",
    "6. 내부관리계획 수립 및 시행",
    "제10조 (공무원 전용 게시판 운영)",
    "① 공무원 전용 익명 게시판은 일반 회원에게 작성자의 신원을 공개하지 않습니다.",
    "② 회사는 서비스 운영 및 보안 목적에 한하여 작성자의 회원정보와 게시글을 내부적으로 연결하여 관리할 수 있습니다.",
    "③ 법령에 따른 법원 또는 수사기관의 적법한 요청이 있는 경우 관련 정보를 제공할 수 있습니다.",
    "④ 회사는 개인정보 유출, 명예훼손 또는 법령 위반 게시물에 대하여 삭제 또는 접근 제한 조치를 할 수 있습니다.",
    "제11조 (개인정보 보호책임자)",
    "회사는 개인정보 처리에 관한 업무를 총괄하여 책임지는 개인정보 보호책임자를 지정합니다.",
    "· 성명 : ○○○",
    "· 직책 : 개인정보 보호책임자",
    "· 이메일 : privacy@korlink.co.kr",
    "· 전화 : 0000-0000",
    "※ 서비스 오픈 전 실제 담당자 정보로 변경합니다.",
    "제12조 (권익침해 구제방법)",
    "이용자는 개인정보 침해와 관련하여 다음 기관에 상담 또는 피해구제를 신청할 수 있습니다.",
    "· 개인정보분쟁조정위원회",
    "· 개인정보침해신고센터",
    "· 경찰청 사이버범죄 신고시스템",
    "제13조 (개인정보처리방침의 변경)",
    "① 본 개인정보처리방침은 관련 법령 또는 회사 정책 변경에 따라 수정될 수 있습니다.",
    "② 변경되는 경우 시행일 7일 전(중요한 변경은 30일 전)부터 서비스 내 공지사항을 통하여 안내합니다.",
    "부칙",
    "본 개인정보처리방침은 2026년 ○월 ○일부터 시행합니다.",
  ].join("\n");

  const CONSENT_SUMMARY =
    '주식회사 KORLINK(이하 "회사")는 「개인정보 보호법」 등 관련 법령에 따라 회원가입 및 서비스 제공을 위하여 아래와 같이 개인정보를 수집·이용합니다.';
  const CONSENT_FULL = [
    "개인정보 수집·이용 동의",
    '주식회사 KORLINK(이하 "회사")는 「개인정보 보호법」 등 관련 법령에 따라 회원가입 및 서비스 제공을 위하여 아래와 같이 개인정보를 수집·이용합니다.',
    "1. 개인정보 수집·이용 목적",
    "회사는 다음의 목적을 위하여 개인정보를 수집·이용합니다.",
    "· 회원가입 및 본인 확인",
    "· 공무원 회원 및 공급업체 회원 자격 확인",
    "· 서비스 제공 및 회원 관리",
    "· 견적요청, 발주, 계약 및 거래 관리",
    "· 결제 및 정산 서비스 제공",
    "· 고객 문의 및 민원 처리",
    "· 서비스 개선 및 운영",
    "· 부정 이용 방지 및 보안 관리",
    "· 관계 법령에 따른 의무 이행",
    "2. 수집하는 개인정보 항목",
    "(1) 공통 회원",
    "· 성명",
    "· 아이디(ID)",
    "· 비밀번호(암호화 저장)",
    "· 휴대전화번호",
    "· 이메일 주소",
    "(2) 공무원/구매담당자 회원",
    "· 소속기관명",
    "· 부서명",
    "· 직급(선택)",
    "· 기관 고유번호 또는 사업자등록번호(필요한 경우)",
    "(3) 공급업체 회원",
    "· 회사명",
    "· 사업자등록번호",
    "· 대표자명",
    "· 사업장 주소",
    "· 담당자 성명",
    "· 담당자 연락처",
    "· 담당자 이메일",
    "· 사업자등록증 등 회사가 요구하는 증빙자료",
    "(4) 서비스 이용 과정에서 자동으로 생성되는 정보",
    "· IP주소",
    "· 접속기록",
    "· 쿠키(Cookie)",
    "· 기기정보",
    "· 브라우저 정보",
    "· 서비스 이용기록",
    "3. 개인정보 보유 및 이용기간",
    "회사는 개인정보 수집·이용 목적이 달성될 때까지 개인정보를 보유합니다.",
    "다만, 관계 법령에 따라 보관이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관합니다.",
    "예시)",
    "· 계약 또는 청약철회 등에 관한 기록 : 5년",
    "· 대금결제 및 재화 등의 공급에 관한 기록 : 5년",
    "· 소비자 불만 또는 분쟁처리에 관한 기록 : 3년",
    "· 접속기록 : 3개월",
    "회원 탈퇴 시에는 법령상 보관 의무가 있는 정보를 제외하고 지체 없이 파기합니다.",
    "4. 동의를 거부할 권리 및 불이익",
    "이용자는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.",
    "다만, 필수 개인정보 수집·이용에 동의하지 않을 경우 회원가입 및 KORLINK 서비스 이용이 제한될 수 있습니다.",
    "5. 동의 여부",
    "본인은 위 내용을 충분히 확인하였으며, 개인정보의 수집 및 이용에 동의합니다.",
  ].join("\n");

  const TERMS = [
    { type: "SERVICE" as const, title: "서비스 이용약관", summary: SERVICE_SUMMARY, content: SERVICE_FULL, required: true },
    { type: "PRIVACY" as const, title: "개인정보 처리방침", summary: PRIVACY_SUMMARY, content: PRIVACY_FULL, required: true },
    { type: "CONSENT" as const, title: "개인정보 수집·이용 동의", summary: CONSENT_SUMMARY, content: CONSENT_FULL, required: true },
    { type: "SUPPLIER" as const, title: "판매자 특별 약관 및 정산 약정", summary: SUPPLIER_SUMMARY, content: SUPPLIER_SUMMARY, required: true },
    { type: "MARKETING" as const, title: "마케팅 정보 수신", summary: "혜택 및 이벤트 정보 수신에 동의합니다.", content: "혜택 및 이벤트 정보 수신에 동의합니다.", required: false },
  ];
  for (const t of TERMS) {
    const data = { title: t.title, summary: t.summary, content: t.content, contentHtml: toTermHtml(t.content), required: t.required };
    await prisma.term.upsert({
      where: { type_version: { type: t.type, version: "1.0" } },
      update: data,
      create: { type: t.type, version: "1.0", ...data },
    });
  }

  const org = await prisma.organization.upsert({
    where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890") },
    update: {},
    create: {
      name: "화성시청",
      businessRegistrationNo: encField("Organization", "businessRegistrationNo", "123-45-67890")!,
      region: "경기",
    },
  });
  await prisma.user.upsert({
    where: { email: "official@test.com" },
    update: {},
    create: {
      email: "official@test.com",
      passwordHash: pw,
      role: "OFFICIAL",
      name: encField("User", "name", "공무원01")!,
      organizationId: org.id,
      departmentName: "도로관리과",
    },
  });

  const existingCompany = await prisma.supplierCompany.findFirst({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00001") },
    select: { id: true },
  });
  const company = existingCompany
    ? await prisma.supplierCompany.update({
        where: { id: existingCompany.id },
        data: { approvalStatus: "APPROVED", name: "디지털솔루션(주)", region: "경기도 성남시" },
      })
    : await prisma.supplierCompany.create({
        data: {
          name: "디지털솔루션(주)",
          region: "경기도 성남시",
          representativeName: encField("SupplierCompany", "representativeName", "공급01")!,
          businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "211-88-00001")!,
          address: encField("SupplierCompany", "address", "경기도 화성시"),
          phone: encField("SupplierCompany", "phone", "031-000-0000"),
          approvalStatus: "APPROVED",
        },
      });
  await prisma.user.upsert({
    where: { email: "supplier@test.com" },
    update: {},
    create: {
      email: "supplier@test.com",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "공급01 담당자")!,
      supplierCompanyId: company.id,
    },
  });

  const existingPending = await prisma.supplierCompany.findFirst({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00002") },
    select: { id: true },
  });
  const pending = existingPending ?? await prisma.supplierCompany.create({
    data: {
      name: "대기업체",
      representativeName: encField("SupplierCompany", "representativeName", "대기")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "211-88-00002")!,
      address: encField("SupplierCompany", "address", "경기도 수원시"),
      phone: encField("SupplierCompany", "phone", "031-111-1111"),
      approvalStatus: "PENDING",
    },
  });
  await prisma.user.upsert({
    where: { email: "pending@test.com" },
    update: {},
    create: {
      email: "pending@test.com",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "대기 담당자")!,
      supplierCompanyId: pending.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "official@korlink.co.kr" },
    update: { passwordHash: pw, role: "OFFICIAL", status: "ACTIVE", organizationId: org.id, name: encField("User", "name", "공무원 데모")! },
    create: {
      email: "official@korlink.co.kr",
      passwordHash: pw,
      role: "OFFICIAL",
      name: encField("User", "name", "공무원 데모")!,
      organizationId: org.id,
      departmentName: "도로관리과",
    },
  });
  await prisma.user.upsert({
    where: { email: "supplier@korlink.co.kr" },
    update: { passwordHash: pw, role: "SUPPLIER", status: "ACTIVE", supplierCompanyId: company.id, name: encField("User", "name", "공급사 데모")! },
    create: {
      email: "supplier@korlink.co.kr",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "공급사 데모")!,
      supplierCompanyId: company.id,
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@korlink.co.kr" },
    update: { passwordHash: pw, role: "ADMIN", status: "ACTIVE", name: encField("User", "name", "관리자")! },
    create: {
      email: "admin@korlink.co.kr",
      passwordHash: pw,
      role: "ADMIN",
      name: encField("User", "name", "관리자")!,
    },
  });

  const catIds: string[] = [];
  let topCount = 0;
  let midCount = 0;
  let leafCount = 0;

  for (let ti = 0; ti < CATEGORY_TAXONOMY.length; ti++) {
    const top = CATEGORY_TAXONOMY[ti];
    const topId = `cat-${ti + 1}`;
    const topData = { code: topCode(ti), name: top.name, level: 1, parentId: null, sortOrder: ti };
    await prisma.category.upsert({
      where: { id: topId },
      update: topData,
      create: { id: topId, ...topData },
    });
    catIds.push(topId);
    topCount++;

    for (let mi = 0; mi < top.mids.length; mi++) {
      const mid = top.mids[mi];
      const mCode = midCode(ti, mi);
      const midData = { name: mid.name, level: 2, parentId: topId, sortOrder: mi };
      const midRow = await prisma.category.upsert({
        where: { code: mCode },
        update: midData,
        create: { code: mCode, ...midData },
      });
      midCount++;

      const leaves: { name: string; itemType: "GOODS" | "SERVICE"; code: string }[] = [
        ...mid.goods.map((name, li) => ({
          name,
          itemType: "GOODS" as const,
          code: leafCode(ti, mi, "GOODS", li),
        })),
        ...mid.service.map((name, li) => ({
          name,
          itemType: "SERVICE" as const,
          code: leafCode(ti, mi, "SERVICE", li),
        })),
      ];
      for (let li = 0; li < leaves.length; li++) {
        const leaf = leaves[li];
        const leafData = {
          name: leaf.name,
          level: 3,
          parentId: midRow.id,
          itemType: leaf.itemType,
          sortOrder: li,
        };
        await prisma.category.upsert({
          where: { code: leaf.code },
          update: leafData,
          create: { code: leaf.code, ...leafData },
        });
        leafCount++;
      }
    }
  }

  const REMICON_SPECS = [
    { label: "강도등급", value: "24-40-140(중기)" },
    { label: "최대입자경", value: "25mm 이하" },
    { label: "탈형재", value: "액상형" },
    { label: "콘크리트양", value: "1㎥" },
    { label: "중기노출재", value: "미혼입" },
    { label: "시멘트 종류", value: "보통포틀랜드시멘트" },
    { label: "혼합재비율", value: "중기(S)" },
    { label: "제조방식", value: "미생성" },
    { label: "보유마크", value: "우수제품" },
  ];
  const REMICON_COMPANY = {
    rep: "김철수",
    bizNo: "123-45-67890",
    region: "경기도 화성시",
    phone: "031-123-4567",
    establishedYear: 2010,
    dealCount: 128,
    intro: "경기도 도로교통 분야 15년 이상 경력의 공공조달 전문 기업입니다.",
    certifications: ["우수제품"],
    portfolioFileName: "경기건설_주요납품실적_2024.pdf",
    description:
      "경기건설(주)는 2010년 설립 이래 경기도 내 주요 도로공사 및 토목공사에 참여해온 전문 건설자재 공급 업체입니다.\n\n도로포장재, 레미콘, 아스팔트 등 토목 자재를 중심으로 45종 이상의 상품을 보유하고 있으며, 화성시청, 수원시청 등 경기도 내 28개 지자체와 지속적인 거래 관계를 유지하고 있습니다.\n\n우수조달제품 인증을 보유하고 있으며, ISO 9001 품질경영시스템 인증을 취득하여 제품 품질의 일관성을 보장합니다.",
  };

  const DEMO = [
    { biz: "123-45-67890", company: "경기건설(주)", name: "레미콘(혼합콘크리트) 24-40-140(중기)", price: 115000, cat: 0, img: "/products/p01.png", nps: "12203515", rating: 4.7, reviews: 128, unit: "㎥", badges: ["우수제품"], min: 5, dd: 2, dc: "상차도", specs: REMICON_SPECS, comp: REMICON_COMPANY },
    { biz: "700-01-00002", company: "화성레미콘(주)", name: "레미콘(혼합콘크리트) 30-37-150(고기)", price: 125000, cat: 0, img: "/products/p02.png", nps: "12203516", rating: 4.5, reviews: 86, unit: "㎥", badges: ["우수제품", "창업기업"] },
    { biz: "700-01-00003", company: "포장산업(주)", name: "아스콘(노상용) 표준배합 15-40", price: 95000, cat: 0, img: "/products/p03.png", nps: "45501301", rating: 4.8, reviews: 203, unit: "톤", badges: ["우수제품", "여성기업"] },
    { biz: "700-01-00004", company: "안전제품(주)", name: "교통안전용품(콘) 반사원형콘 750mm", price: 8500, cat: 3, img: "/products/p04.png", nps: "39107101", rating: 4.6, reviews: 312, unit: "개", badges: ["장애인기업"] },
    { biz: "700-01-00005", company: "안전난간(주)", name: "도로안전시설물(난간) 강관난간 2중난간", price: 180000, cat: 0, img: "/products/p05.png", nps: "39107201", rating: 4.4, reviews: 67, unit: "m", badges: ["우수제품", "사회적기업"] },
    { biz: "700-01-00006", company: "디지털솔루션(주)", name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", price: 890000, cat: 4, img: "/products/p06.png", nps: "43201501", rating: 4.9, reviews: 456, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00007", company: "오피스텍(주)", name: "프린터(레이저) 흑백 A4 45ppm", price: 450000, cat: 4, img: "/products/p07.png", nps: "43202601", rating: 4.5, reviews: 234, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00008", company: "네트웍솔루션(주)", name: "네트워크장비(스위치) 48포트 L3 관리형", price: 1200000, cat: 4, img: "/products/p08.png", nps: "43401301", rating: 4.7, reviews: 89, unit: "대", badges: ["우수제품", "창업기업"] },
    { biz: "700-01-00009", company: "안전소방(주)", name: "소방장비(소화기) 분말소화기 3.3kg", price: 35000, cat: 3, img: "/products/p09.png", nps: "32101501", rating: 4.8, reviews: 567, unit: "개", badges: ["우수제품", "장애인기업"] },
    { biz: "700-01-00010", company: "안전소방(주)", name: "소방장비(소방호스) 압송용 65A 20m", price: 78000, cat: 3, img: "/products/p10.png", nps: "32101301", rating: 4.6, reviews: 145, unit: "개", badges: ["우수제품"] },
    { biz: "700-01-00011", company: "안전복지(주)", name: "보호복(일반작업용) 반사통풍형 XL", price: 25000, cat: 3, img: "/products/p11.png", nps: "39108101", rating: 4.3, reviews: 89, unit: "벌", badges: ["여성기업", "사회적기업"] },
    { biz: "700-01-00012", company: "메디칼텍(주)", name: "의료기기(혈압계) 자동전자혈압계 상완식", price: 95000, cat: 6, img: "/products/p12.png", nps: "21201401", rating: 4.9, reviews: 234, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00013", company: "오피스퍼니처(주)", name: "사무용가구(책상) 일반 사무용 책상 1400x700", price: 145000, cat: 2, img: "/products/p13.png", nps: "25101101", rating: 4.4, reviews: 178, unit: "개", badges: ["우수제품"] },
    { biz: "700-01-00014", company: "에듀퍼니처(주)", name: "교육기관용가구(학생책상) 1인용 600x400", price: 68000, cat: 2, img: "/products/p14.png", nps: "25103101", rating: 4.5, reviews: 234, unit: "개", badges: ["우수제품", "사회적기업"] },
    { biz: "700-01-00015", company: "클라이밋텍(주)", name: "냉난방기(에어컨) 벽걸이형 18평형", price: 680000, cat: 1, img: "/products/p15.png", nps: "47102101", rating: 4.7, reviews: 345, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00016", company: "경기농협(주)", name: "농산물(쌀) 경기미 특등급 20kg", price: 58000, cat: 6, img: "/products/p16.png", nps: "61101101", rating: 4.8, reviews: 890, unit: "포", badges: ["사회적기업", "여성기업"] },
  ];
  for (let i = 0; i < DEMO.length; i++) {
    const p = DEMO[i];
    const comp = "comp" in p ? p.comp : undefined;
    const companyFields = comp
      ? {
          representativeName: encField("SupplierCompany", "representativeName", comp.rep)!,
          phone: encField("SupplierCompany", "phone", comp.phone),
          region: comp.region,
          establishedYear: comp.establishedYear,
          dealCount: comp.dealCount,
          intro: comp.intro,
          description: comp.description,
          certifications: comp.certifications,
          portfolioFileName: comp.portfolioFileName,
        }
      : { representativeName: encField("SupplierCompany", "representativeName", p.company)! };
    const existingProd = await prisma.supplierCompany.findFirst({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", p.biz) },
      select: { id: true },
    });
    const company = existingProd
      ? await prisma.supplierCompany.update({
          where: { id: existingProd.id },
          data: { approvalStatus: "APPROVED", ...companyFields },
        })
      : await prisma.supplierCompany.create({
          data: {
            name: p.company,
            businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", p.biz)!,
            approvalStatus: "APPROVED",
            ...companyFields,
          },
        });
    const data = {
      supplierCompanyId: company.id,
      categoryId: catIds[p.cat],
      name: p.name,
      price: p.price,
      unit: p.unit,
      status: "ACTIVE" as const,
      npsCode: p.nps,
      rating: p.rating,
      reviewCount: p.reviews,
      badges: p.badges,
      minOrderQty: p.min ?? null,
      deliveryDays: p.dd ?? null,
      deliveryCondition: p.dc ?? null,
      specs: "specs" in p ? p.specs : undefined,
    };
    const prod = await prisma.product.upsert({
      where: { id: `demo-${i + 1}` },
      update: data,
      create: { id: `demo-${i + 1}`, ...data },
    });
    await prisma.productImage.upsert({
      where: { id: `demo-img-${i + 1}` },
      update: { url: p.img },
      create: { id: `demo-img-${i + 1}`, productId: prod.id, url: p.img, sortOrder: 0 },
    });
    await prisma.inventory.upsert({
      where: { productId: prod.id },
      update: {},
      create: { productId: prod.id, quantity: 100 },
    });
  }

  console.log(`seed done: [korink.co.kr] official@korlink.co.kr / supplier@korlink.co.kr / admin@korlink.co.kr  [test] official@test.com / supplier@test.com / pending@test.com  (pw: Test1234!) + ${DEMO.length} products | categories: ${topCount} top / ${midCount} mid / ${leafCount} leaf`);

  const ctx: SeedCtx = { pwHash: pw };
  const domainSeeds: [string, (p: PrismaClient, c: SeedCtx) => Promise<string>][] = [
    ["members", seedMembers],
    ["supplier-profile", seedSupplierProfile],
    ["quotes", seedQuotes],
    ["chats", seedChats],
    ["orders", seedOrders],
    ["subscriptions", seedSubscriptions],
    ["community", seedCommunity],
    ["info", seedInfo],
    ["news", seedNews],
    ["claims", seedClaims],
    ["notifications", seedNotifications],
    ["reviews", seedReviews],
    ["nara", seedNara],
    ["partner-products", seedPartnerProducts],
  ];
  for (const [name, fn] of domainSeeds) {
    const summary = await fn(prisma, ctx);
    console.log(`  [${name}] ${summary}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
