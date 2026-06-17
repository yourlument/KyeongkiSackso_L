import { loadAdminContents } from "@/lib/admin-contents";
import { ContentsView } from "./contents-view";

export const dynamic = "force-dynamic";

export default async function AdminContentsPage() {
  const data = await loadAdminContents();
  return <ContentsView data={data} />;
}
