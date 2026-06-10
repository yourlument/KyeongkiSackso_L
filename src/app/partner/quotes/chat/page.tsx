import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { QuoteChatView } from "./quote-chat-view";

export default async function PartnerQuoteChatPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  return <QuoteChatView />;
}
