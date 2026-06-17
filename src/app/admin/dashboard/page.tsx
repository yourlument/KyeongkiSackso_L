import { loadAdminDashboard } from "@/lib/admin-dashboard";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await loadAdminDashboard(Date.now());
  return <DashboardView data={data} />;
}
