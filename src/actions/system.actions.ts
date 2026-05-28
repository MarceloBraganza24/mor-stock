"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { AuditLog } from "@/models/AuditLog";

export async function getSystemStatus() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = await Store.findById(session.user.store);

  const lastBackup = await AuditLog.findOne({
    store: session.user.store!,
    action: { $in: ["RESTORE_BACKUP", "DOWNLOAD_BACKUP"] },
  }).sort({ createdAt: -1 });

  return JSON.parse(
    JSON.stringify({
      version: "1.0.0 MVP",
      plan: store?.plan || "FREE",
      subscriptionStatus: store?.subscription?.status || "NONE",
      storeStatus: store?.isActive ? "Activo" : "Suspendido",
      lastBackup,
    })
  );
}