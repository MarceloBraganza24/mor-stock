"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { storeSettingsSchema } from "@/lib/validations";
import { getPlanLimits } from "@/lib/plans";

export async function getCurrentStore() {
  const session = await requireRoles(["OWNER", "CASHIER", "STOCKER", "DELIVERY"]);

  await connectDB();

  const store = await Store.findOne({
    _id: session.user.store,
    isActive: true,
  });

  return JSON.parse(JSON.stringify(store));
}

export async function updateStoreSettings(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  const parsed = storeSettingsSchema.parse({
    name: formData.get("name"),
    city: formData.get("city"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    businessType: formData.get("businessType"),
    currency: formData.get("currency"),
    logoUrl: formData.get("logoUrl"),
    openingHours: formData.get("openingHours"),
    expirationAlertDays: formData.get("expirationAlertDays"),
    defaultDeliveryFee: formData.get("defaultDeliveryFee"),
    theme: String(formData.get("theme") || "dark"),
  });

  await connectDB();

  await Store.findOneAndUpdate(
    {
      _id: session.user.store,
      owner: session.user.id,
    },
    {
      ...parsed,
      "onboarding.storeCompleted": true,
    }
  );

  revalidatePath("/configuracion");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function getOnboardingStatus() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = await Store.findById(session.user.store);

  const productsCount = await Product.countDocuments({
    store: session.user.store,
    isActive: true,
  });

  const storeCompleted = Boolean(store?.onboarding?.storeCompleted);
  const firstProductCreated = productsCount > 0;
  const firstCashOpened = Boolean(store?.onboarding?.firstCashOpened);

  const completed = storeCompleted && firstProductCreated && firstCashOpened;

  if (store) {
    store.onboarding.firstProductCreated = firstProductCreated;
    store.onboarding.completed = completed;
    await store.save();
  }

  return JSON.parse(
    JSON.stringify({
      storeCompleted,
      firstProductCreated,
      firstCashOpened,
      completed,
      plan: store?.plan || "FREE",
    })
  );
}

export async function getPlanUsage() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = await Store.findById(session.user.store);

  const [productsCount, employeesCount] = await Promise.all([
    Product.countDocuments({
      store: session.user.store,
      isActive: true,
    }),
    User.countDocuments({
      store: session.user.store,
      role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
      isActive: true,
    }),
  ]);

  const plan = store?.plan || "FREE";
  const subscriptionStatus = store?.subscription?.status || "NONE";

  const effectivePlan =
    plan === "FREE" || subscriptionStatus === "ACTIVE" ? plan : "FREE";

  const limits = getPlanLimits(effectivePlan);

  return JSON.parse(
    JSON.stringify({
      plan,
      limits,
      subscription: store?.subscription || null,
      productsCount,
      employeesCount,
      effectivePlan,
      subscriptionStatus,
    })
  );
}