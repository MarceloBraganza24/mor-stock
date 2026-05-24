export const plans = {
  FREE: {
    name: "Gratis",
    maxProducts: 50,
    maxEmployees: 1,
    reports: false,
    advancedReports: false,
    delivery: false,
    purchases: false,
  },
  BASIC: {
    name: "Básico",
    maxProducts: 500,
    maxEmployees: 3,
    reports: true,
    advancedReports: false,
    delivery: true,
    purchases: true,
  },
  PRO: {
    name: "Pro",
    maxProducts: 5000,
    maxEmployees: 10,
    reports: true,
    advancedReports: true,
    delivery: true,
    purchases: true,
  },
};

export type PlanKey = keyof typeof plans;

export function getPlanLimits(plan?: string) {
  return plans[(plan as PlanKey) || "FREE"] || plans.FREE;
}