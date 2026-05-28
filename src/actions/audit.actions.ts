"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";

export async function getAuditLogs() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const logs = await AuditLog.find({
    store: session.user.store!,
  })
    .populate("user", "name role email")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(logs));
}