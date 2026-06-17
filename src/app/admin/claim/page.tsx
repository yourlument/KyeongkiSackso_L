import { loadAdminClaim } from "@/lib/admin-claim";
import { ClaimView } from "./claim-view";

export const dynamic = "force-dynamic";

export default async function AdminClaimPage() {
  const data = await loadAdminClaim();
  return <ClaimView data={data} />;
}
