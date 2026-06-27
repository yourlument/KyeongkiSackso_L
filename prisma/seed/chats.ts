import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";

const CHAT_SYSTEM_NOTE = "견적 문의 채팅방이 개설되었습니다. 기술 문의 및 추가 자료 전송이 가능합니다.";

type MsgSeed = {
  id: string;
  from: "OFFICIAL" | "SUPPLIER" | "SYSTEM";
  body?: string;
  fileName?: string;
  at: string;
  isRead: boolean;
};

async function findQuoteByTitle(prisma: PrismaClient, title: string) {
  return prisma.quoteRequest.findFirst({
    where: { title },
    orderBy: { id: "asc" },
    select: { id: true, officialId: true },
  });
}

export async function seedChats(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  let stubQuotes = 0;

  const digitalCompany = await prisma.supplierCompany.findUnique({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00001") },
    select: { id: true },
  });
  const supplierUser = await prisma.user.findUnique({
    where: { email: "supplier@korlink.co.kr" },
    select: { id: true },
  });
  const fallbackOfficial = await prisma.user.findUnique({
    where: { email: "official@korlink.co.kr" },
    select: { id: true },
  });
  if (!digitalCompany || !supplierUser || !fallbackOfficial) {
    throw new Error("seedChats: 기본 시드(prisma/seed.ts) 엔티티 누락 — seed.ts 선실행 필요");
  }

  const machineryCompany = await prisma.supplierCompany.upsert({
    where: { id: "sco-기계공업(주)" },
    update: { approvalStatus: "APPROVED" },
    create: {
      id: "sco-기계공업(주)",
      name: "기계공업(주)",
      representativeName: encField("SupplierCompany", "representativeName", "기계공업(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "999-00-10001")!,
      phone: encField("SupplierCompany", "phone", "031-123-4567"),
      approvalStatus: "APPROVED",
    },
  });

  const newUsers: string[] = [];
  async function ensureQuote(args: {
    stubId: string;
    title: string;
    orgName: string;
    dept: string;
    phone: string | null;
    quoteType: "GOODS" | null;
  }) {
    const found = await findQuoteByTitle(prisma, args.title);
    if (found) return found;
    stubQuotes++;
    const org =
      (await prisma.organization.findFirst({ where: { name: args.orgName }, orderBy: { createdAt: "asc" } })) ??
      (await prisma.organization.upsert({
        where: { id: `org-${args.orgName}` },
        update: {},
        create: { id: `org-${args.orgName}`, name: args.orgName },
      }));
    const email = `seed-${(args.orgName + args.dept).replace(/\s+/g, "")}@korlink.demo`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        name: encField("User", "name", args.orgName)!,
        phone: args.phone ? encField("User", "phone", args.phone) : null,
        organizationId: org.id,
        departmentName: args.dept,
      },
    });
    newUsers.push(email);
    const quote = await prisma.quoteRequest.upsert({
      where: { id: args.stubId },
      update: {},
      create: {
        id: args.stubId,
        officialId: user.id,
        title: args.title,
        status: "OPEN",
        quoteType: args.quoteType,
      },
    });
    return { id: quote.id, officialId: user.id };
  }

  const qSuji = await findQuoteByTitle(prisma, "수지 보강 프로젝트 발전기 및 베어링 구매");
  const qRoad = await ensureQuote({
    stubId: "chat-qr-2",
    title: "2026년 2분기 도로보수 공사 자재 구매",
    orgName: "화성시청",
    dept: "도로과",
    phone: "031-369-1234",
    quoteType: null,
  });
  const qIt = await ensureQuote({
    stubId: "chat-qr-3",
    title: "화성시청 IT장비 신규 구축 프로젝트",
    orgName: "화성시청",
    dept: "정보통신과",
    phone: "031-369-1234",
    quoteType: null,
  });
  const qYongin = await ensureQuote({
    stubId: "chat-qr-4",
    title: "용인시청 정보통신과 IT 장비 보강 (물품 견적)",
    orgName: "용인시청",
    dept: "디지털정보과",
    phone: "031-369-1234",
    quoteType: "GOODS",
  });

  const qSujiResolved =
    qSuji ??
    (await (async () => {
      stubQuotes++;
      const quote = await prisma.quoteRequest.upsert({
        where: { id: "chat-qr-1" },
        update: {},
        create: {
          id: "chat-qr-1",
          officialId: fallbackOfficial.id,
          title: "수지 보강 프로젝트 발전기 및 베어링 구매",
          status: "OPEN",
          quoteType: "GOODS",
        },
      });
      return { id: quote.id, officialId: fallbackOfficial.id };
    })());

  const THREADS: { id: string; quote: { id: string; officialId: string }; supplierCompanyId: string; messages: MsgSeed[] }[] = [
    {
      id: "chat-1",
      quote: qSujiResolved,
      supplierCompanyId: machineryCompany.id,
      messages: [
        { id: "msg-1-1", from: "OFFICIAL", body: "안녕하세요", at: "2026-05-19T16:59:00", isRead: false },
        { id: "msg-1-2", from: "OFFICIAL", body: "견적서 관련 자료입니다.", at: "2026-05-19T16:59:00", isRead: false },
        { id: "msg-1-3", from: "OFFICIAL", fileName: "다운로드.jpg", at: "2026-05-19T16:59:00", isRead: false },
      ],
    },
    {
      id: "chat-2",
      quote: qRoad,
      supplierCompanyId: digitalCompany.id,
      messages: [
        { id: "msg-2-0", from: "SYSTEM", body: CHAT_SYSTEM_NOTE, at: "2026-05-03T10:15:00", isRead: true },
        { id: "msg-2-1", from: "SUPPLIER", body: "안녕하세요. 레미콘 50㎥, 아스콘 30톤 납품 관련 문의주셔서 감사합니다. 화성시청 직접 배송 가능합니다.", at: "2026-05-03T10:15:00", isRead: true },
        { id: "msg-2-2", from: "SUPPLIER", body: "자재 품질 확인서 첨부했습니다.", at: "2026-05-06T14:20:00", isRead: true },
        { id: "msg-2-3", from: "OFFICIAL", body: "사양서 확인했습니다. 배송 시간대를 오전 9시~12시로 지정 가능한가요?", at: "2026-05-07T10:30:00", isRead: false },
        { id: "msg-2-4", from: "SUPPLIER", body: "네, 가능합니다. 해당 시간대 배송 예정으로 처리하겠습니다. 아래 배송 일정표 첨부드립니다.", at: "2026-05-07T10:45:00", isRead: true },
        { id: "msg-2-5", from: "OFFICIAL", body: "일정표 잘 받았습니다. 계약 진행 방향으로 검토하겠습니다.", at: "2026-05-07T11:00:00", isRead: false },
      ],
    },
    {
      id: "chat-3",
      quote: qIt,
      supplierCompanyId: digitalCompany.id,
      messages: [
        { id: "msg-3-0", from: "SYSTEM", body: CHAT_SYSTEM_NOTE, at: "2026-05-06T16:00:00", isRead: true },
        { id: "msg-3-1", from: "SUPPLIER", body: "AS 3년 보증 조건으로 견적 제출했습니다.", at: "2026-05-06T16:00:00", isRead: true },
        { id: "msg-3-2", from: "SUPPLIER", body: "견적서 PDF 첨부했습니다. 검토 부탁드립니다.", at: "2026-05-07T09:31:00", isRead: true },
      ],
    },
    {
      id: "chat-4",
      quote: qYongin,
      supplierCompanyId: digitalCompany.id,
      messages: [
        { id: "msg-4-0", from: "SYSTEM", body: CHAT_SYSTEM_NOTE, at: "2026-05-13T15:30:00", isRead: true },
        { id: "msg-4-1", from: "SUPPLIER", body: "설치 인력 2명 동행 가능합니다.", at: "2026-05-13T15:30:00", isRead: true },
        { id: "msg-4-2", from: "OFFICIAL", body: "업무용 PC 15대 사양서 첨부드립니다.", at: "2026-05-14T10:00:00", isRead: false },
      ],
    },
  ];

  const roadResponder = await prisma.quoteResponse.findFirst({
    where: { quoteRequestId: qRoad.id, supplierCompany: { name: "경기건설(주)" } },
    select: { supplierCompanyId: true },
  });
  if (roadResponder) {
    THREADS.push({
      id: "chat-5",
      quote: qRoad,
      supplierCompanyId: roadResponder.supplierCompanyId,
      messages: [
        { id: "msg-5-0", from: "SYSTEM", body: CHAT_SYSTEM_NOTE, at: "2026-05-09T09:30:00", isRead: true },
        { id: "msg-5-1", from: "SUPPLIER", body: "안녕하세요. 도로보수 자재 견적 제출했습니다. 아스콘·경계석 모두 당일 납품 가능합니다.", at: "2026-05-09T09:31:00", isRead: true },
        { id: "msg-5-2", from: "OFFICIAL", body: "견적 확인했습니다. 아스콘 KS 인증 규격 맞는지 확인 부탁드립니다.", at: "2026-05-09T10:05:00", isRead: false },
        { id: "msg-5-3", from: "SUPPLIER", body: "네, KS F 2349 인증 자재입니다. 시험성적서 함께 제출하겠습니다.", at: "2026-05-09T10:20:00", isRead: true },
      ],
    });
  }

  let threadCount = 0;
  let messageCount = 0;
  for (const t of THREADS) {
    const thread = await prisma.chatThread.upsert({
      where: {
        quoteRequestId_supplierCompanyId: {
          quoteRequestId: t.quote.id,
          supplierCompanyId: t.supplierCompanyId,
        },
      },
      update: {},
      create: { id: t.id, quoteRequestId: t.quote.id, supplierCompanyId: t.supplierCompanyId },
    });
    threadCount++;

    for (const m of t.messages) {
      const data = {
        threadId: thread.id,
        senderId: m.from === "SYSTEM" ? null : m.from === "OFFICIAL" ? t.quote.officialId : supplierUser.id,
        body: m.body ?? null,
        fileUrl: null,
        fileName: m.fileName ?? null,
        isSystem: m.from === "SYSTEM",
        isRead: m.isRead,
        createdAt: new Date(m.at),
      };
      await prisma.chatMessage.upsert({
        where: { id: m.id },
        update: data,
        create: { id: m.id, ...data },
      });
      messageCount++;
    }
  }

  return `chats: ${threadCount} threads / ${messageCount} messages (시스템 3건 포함)${stubQuotes ? ` / 공고 스텁 ${stubQuotes}건(chat-qr-*) 생성 — quotes 모듈 미시드분` : ""}${newUsers.length ? ` / 신규 공무원 ${newUsers.length}명` : ""}`;
}
