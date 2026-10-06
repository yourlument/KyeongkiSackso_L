export type OrderPaymentSnapshot = {
  status: string;
  method: string | null;
  transactionId: string | null;
  paidAt: Date | string | null;
};

const PAID_ORDER_STATUSES = new Set([
  "PAID",
  "CONTRACTED",
  "SHIPPING",
  "DELIVERED",
  "COMPLETED",
]);

const CANCELLED_PAYMENT_STATUSES = new Set(["CANCELLED", "REFUNDED"]);

export function isPaidOrderPayment(
  orderStatus: string,
  payment: OrderPaymentSnapshot | null | undefined,
): boolean {
  return (
    PAID_ORDER_STATUSES.has(orderStatus) &&
    payment?.status === "PAID" &&
    payment.paidAt != null
  );
}

export function isIssuedVirtualAccount(
  orderStatus: string,
  payment: OrderPaymentSnapshot | null | undefined,
): boolean {
  return (
    orderStatus === "PENDING" &&
    payment?.status === "READY" &&
    payment.method === "가상계좌" &&
    Boolean(payment.transactionId)
  );
}

export function isCancelledOrderPayment(
  orderStatus: string,
  payment: OrderPaymentSnapshot | null | undefined,
): boolean {
  return (
    orderStatus === "CANCELLED" &&
    CANCELLED_PAYMENT_STATUSES.has(payment?.status ?? "") &&
    Boolean(payment?.transactionId)
  );
}

export function shouldShowPurchaseHistory(
  orderStatus: string,
  payment: OrderPaymentSnapshot | null | undefined,
): boolean {
  return (
    isPaidOrderPayment(orderStatus, payment) ||
    isIssuedVirtualAccount(orderStatus, payment) ||
    isCancelledOrderPayment(orderStatus, payment)
  );
}
