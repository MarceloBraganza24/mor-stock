import mongoose, { Schema, models } from "mongoose";

const auditLogSchema = new Schema(
  {
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: "" },
    description: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AuditLog =
  models.AuditLog || mongoose.model("AuditLog", auditLogSchema);