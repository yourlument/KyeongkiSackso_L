export type ProductRequestStatus = "대기중" | "견적 제출됨";

export type ProductRequest = {
  id: string;
  product: string;
  status: ProductRequestStatus;
  org: string;
  qty: string;
  deadline: string;
  amount?: string;
  submittedAt?: string;
  detail: {
    orgName: string;
    department: string;
    email: string;
    phone: string;
    reqQty: string;
    desiredDate: string;
    address: string;
    note: string;
    attachment: string;
    attachmentUrl?: string | null;
  };
};

export type AnnouncementRow = {
  id: string;
  title: string;
  items: string;
  org: string;
  budget: string;
  deadline: string;
  proposals: string;
};

export type ProposalStatusKind = "접수" | "검토중" | "탈락" | "선정";

export type Proposal = {
  id: string;
  quoteRequestId: string;
  title: string;
  statusKind: ProposalStatusKind;
  org: string;
  deadline: string;
  submittedAt: string;
  amount: string;
  spec: string;
  attachment: string;
  attachmentUrl?: string | null;
};
