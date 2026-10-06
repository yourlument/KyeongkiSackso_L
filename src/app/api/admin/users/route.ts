import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import {
  loadAdminUsers,
  parseAdminUserSortSelection,
} from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const query = new URL(req.url).searchParams;
  const sortSelection = parseAdminUserSortSelection({
    joinOrder: query.get("joinOrder"),
    nameOrder: query.get("nameOrder"),
    sort: query.get("sort"),
    direction: query.get("direction"),
  });
  const role = query.get("role");
  const keyword = query.get("q")?.trim() ?? "";
  const requestedPage = Math.max(1, Number.parseInt(query.get("page") ?? "1", 10) || 1);
  const rows = await loadAdminUsers(sortSelection);
  const filtered = rows
    .filter((row) => (role === "공무원" || role === "공급업체" ? row.role === role : true))
    .filter((row) => (!keyword ? true : (row.name + row.field).includes(keyword)));
  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({ rows: pageRows, sortSelection, page, total: filtered.length, totalPages });
}
