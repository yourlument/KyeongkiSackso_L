import { loadAdminProfit } from "@/lib/admin-profit";
import { ProfitView } from "./profit-view";

export const dynamic = "force-dynamic";

export default async function AdminProfitPage() {
  const data = await loadAdminProfit(Date.now());
  return <ProfitView data={data} />;
}
