import { loadAdminBoard } from "@/lib/admin-board";
import { BoardView } from "./board-view";

export const dynamic = "force-dynamic";

export default async function AdminBoardPage() {
  const data = await loadAdminBoard();
  return <BoardView data={data} />;
}
