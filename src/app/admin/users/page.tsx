import { loadAdminUsers } from "@/lib/admin-users";
import { UsersView } from "./users-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await loadAdminUsers();
  return <UsersView rows={rows} />;
}
