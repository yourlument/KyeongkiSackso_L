export type CheckoutPaymentMethod = "card" | "bank";

export function checkoutRequestKeyForMethod(
  currentKey: string | null,
  currentMethod: CheckoutPaymentMethod,
  nextMethod: CheckoutPaymentMethod,
): string | null {
  return currentMethod === nextMethod ? currentKey : null;
}
