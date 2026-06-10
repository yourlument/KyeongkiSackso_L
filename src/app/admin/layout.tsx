import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen" style={{ background: "#fff" }}>
      <AdminSidebar />
      <main className="min-w-0 flex-1" style={{ background: "#fff" }}>
        <div className="w-full" style={{ maxWidth: "1166.73px", padding: "39.04px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
