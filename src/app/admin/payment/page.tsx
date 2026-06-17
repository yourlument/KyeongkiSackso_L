import { loadAdminPayment } from "@/lib/admin-payment";
import { PaymentView } from "./payment-view";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  const data = await loadAdminPayment(Date.now());
  return <PaymentView data={data} />;
}
