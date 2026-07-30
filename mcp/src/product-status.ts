export const SALES_VERIFICATION_STATUSES = ["verified_active", "verified_suspended", "verified_ended", "unverified", "unknown"] as const;
export type SalesVerificationStatus = typeof SALES_VERIFICATION_STATUSES[number];

const legacyAliases: Record<string, SalesVerificationStatus> = { verified: "verified_active", listed_unverified: "unverified" };

export const normalizeSalesVerificationStatus = (value: unknown): SalesVerificationStatus =>
  typeof value === "string" && (SALES_VERIFICATION_STATUSES as readonly string[]).includes(value)
    ? value as SalesVerificationStatus
    : typeof value === "string" && legacyAliases[value]
      ? legacyAliases[value]
      : "unknown";

export const isVerifiedActive = (value: unknown) => normalizeSalesVerificationStatus(value) === "verified_active";
