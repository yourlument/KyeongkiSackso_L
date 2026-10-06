import type { UserRole, UserStatus } from "@prisma/client";

type SessionAccessInput = {
  status: UserStatus;
  storedRole: UserRole;
  claimRole: UserRole;
  supplierRestricted: boolean;
};

export function canUseSession({
  status,
  storedRole,
  claimRole,
  supplierRestricted,
}: SessionAccessInput): boolean {
  if (status !== "ACTIVE" || storedRole !== claimRole) return false;
  return storedRole !== "SUPPLIER" || !supplierRestricted;
}
