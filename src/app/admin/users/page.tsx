import {
  loadAdminUsers,
  parseAdminUserSortSelection,
} from "@/lib/admin-users";
import { UsersView } from "./users-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ joinOrder?: string; nameOrder?: string; sort?: string; direction?: string; role?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sortSelection = parseAdminUserSortSelection(params);
  const role = params.role === "공무원" || params.role === "공급업체" ? params.role : "전체";
  const query = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const rows = await loadAdminUsers(sortSelection);

  return (
    <UsersView
      rows={rows}
      initialSortSelection={sortSelection}
      initialRole={role}
      initialQuery={query}
      initialPage={page}
    />
  );
}
