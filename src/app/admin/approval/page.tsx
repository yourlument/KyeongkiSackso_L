import { loadAdminApproval } from "@/lib/admin-approval";
import { ApprovalView } from "./approval-view";

export const dynamic = "force-dynamic";

export default async function AdminApprovalPage() {
  const data = await loadAdminApproval();
  return <ApprovalView data={data} />;
}
