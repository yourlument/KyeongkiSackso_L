import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";

export default async function InfoLayout({ children }: { children: React.ReactNode }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role === "SUPPLIER") redirect("/");
  return <>{children}</>;
}
