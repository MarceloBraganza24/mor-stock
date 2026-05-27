import { AuditLog } from "@/models/AuditLog";

export async function createAuditLog({
  store,
  user,
  action,
  entity,
  entityId = "",
  description = "",
  metadata = {},
}: {
  store: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  await AuditLog.create({
    store,
    user,
    action,
    entity,
    entityId,
    description,
    metadata,
  });
}