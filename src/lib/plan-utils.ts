import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { getPlanLimits } from "@/lib/plans";

export async function getStorePlan(storeId: string) {
  const store = await Store.findById(storeId);

  if (!store) {
    throw new Error("Comercio no encontrado");
  }

  const subscriptionStatus = store.subscription?.status || "NONE";

  const effectivePlan =
    store.plan === "FREE" || subscriptionStatus === "ACTIVE"
      ? store.plan
      : "FREE";

  const limits = getPlanLimits(effectivePlan);

  return {
    store,
    plan: store.plan,
    effectivePlan,
    subscriptionStatus,
    limits,
  };
}

export async function assertCanCreateProduct(storeId: string) {
  const { limits } = await getStorePlan(storeId);

  const productsCount = await Product.countDocuments({
    store: storeId,
    isActive: true,
  });

  if (productsCount >= limits.maxProducts) {
    throw new Error(
      `Tu plan permite hasta ${limits.maxProducts} productos. Actualizá el plan para cargar más.`
    );
  }
}

export async function assertCanCreateEmployee(storeId: string) {
  const { limits } = await getStorePlan(storeId);

  const employeesCount = await User.countDocuments({
    store: storeId,
    role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    isActive: true,
  });

  if (employeesCount >= limits.maxEmployees) {
    throw new Error(
      `Tu plan permite hasta ${limits.maxEmployees} empleados. Actualizá el plan para agregar más.`
    );
  }
}

export async function assertFeatureEnabled(
  storeId: string,
  feature: "reports" | "advancedReports" | "delivery" | "purchases"
) {
  const { limits, subscriptionStatus, plan } = await getStorePlan(storeId);

  if (!limits[feature]) {
    if (plan !== "FREE" && subscriptionStatus !== "ACTIVE") {
      throw new Error(
        "Tu suscripción todavía no está activa. Esperá la confirmación del pago."
      );
    }

    throw new Error("Esta funcionalidad no está incluida en tu plan actual.");
  }
}