"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { createAuditLog } from "@/lib/audit";
import { Purchase } from "@/models/Purchase";
import {
  sendStoreReactivatedEmail,
  sendStoreSuspendedEmail,
} from "@/lib/email-templates";

export async function getSuperAdminDashboard() {
  const session = await requireRoles(["SUPER_ADMIN"]);

  await connectDB();

  const [stores, usersCount, productsCount, salesCount] = await Promise.all([
    Store.find({})
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(100),

    User.countDocuments({}),
    Product.countDocuments({ isActive: true }),
    Sale.countDocuments({ status: "COMPLETADA" }),
  ]);

  return JSON.parse(
    JSON.stringify({
      stores,
      usersCount,
      productsCount,
      salesCount,
    })
  );
}

export async function updateStorePlan(storeId: string, plan: "FREE" | "BASIC" | "PRO") {
  const session = await requireRoles(["SUPER_ADMIN"]);

  await connectDB();

  await Store.findByIdAndUpdate(storeId, {
    plan,
    "subscription.status": plan === "FREE" ? "NONE" : "ACTIVE",
  });

  await createAuditLog({
    store: storeId,
    user: session.user.id,
    action: "SUPERADMIN_UPDATE_PLAN",
    entity: "Store",
    entityId: storeId,
    description: `Super Admin cambió plan a ${plan}`,
  });

  revalidatePath("/superadmin");
}

export async function toggleStoreStatus(storeId: string, isActive: boolean) {
  const session = await requireRoles(["SUPER_ADMIN"]);

  await connectDB();

  const store = await Store.findById(storeId).populate("owner", "email");

  if (!store) {
    throw new Error("Comercio no encontrado");
  }

  store.isActive = isActive;
  await store.save();

  await createAuditLog({
    store: store._id.toString(),
    user: session.user.id,
    action: isActive ? "REACTIVATE_STORE" : "SUSPEND_STORE",
    entity: "Store",
    entityId: store._id.toString(),
    description: isActive ? "Reactivó el comercio" : "Suspendió el comercio",
  });

  if ((store.owner as any)?.email) {
    if (isActive) {
      await sendStoreReactivatedEmail((store.owner as any).email, store.name);
    } else {
      await sendStoreSuspendedEmail((store.owner as any).email, store.name);
    }
  }

  revalidatePath("/superadmin");
}

export async function getSuperAdminStoreDetail(storeId: string) {
  await requireRoles(["SUPER_ADMIN"]);

  await connectDB();

  const [store, users, productsCount, salesCount, purchasesCount] =
    await Promise.all([
      Store.findById(storeId).populate("owner", "name email"),
      User.find({ store: storeId }).sort({ createdAt: -1 }),
      Product.countDocuments({ store: storeId, isActive: true }),
      Sale.countDocuments({ store: storeId, status: "COMPLETADA" }),
      Purchase.countDocuments({ store: storeId }),
    ]);

  return JSON.parse(
    JSON.stringify({
      store,
      users,
      productsCount,
      salesCount,
      purchasesCount,
    })
  );
}