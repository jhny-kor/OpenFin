import registry from "../../contracts/capability-status.json" with { type: "json" };

export type ServiceAvailability = "available" | "degraded" | "unavailable";
export type CapabilityStatus = "ready" | "limited" | "blocked";

const serviceAvailability = new Set<string>(registry.service_availability);
const capabilityStatus = new Set<string>(registry.capability_status);

export const asServiceAvailability = (value: unknown, fallback: ServiceAvailability = "unavailable"): ServiceAvailability =>
  serviceAvailability.has(String(value)) ? value as ServiceAvailability : fallback;

export const asCapabilityStatus = (value: unknown, fallback: CapabilityStatus = "blocked"): CapabilityStatus =>
  capabilityStatus.has(String(value)) ? value as CapabilityStatus : fallback;
