import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { QuotesMonitorView } from "./quotes-monitor-view";

export default async function PartnerQuotesPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  return <QuotesMonitorView />;
}
