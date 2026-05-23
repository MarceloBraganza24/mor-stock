import mongoose, { Schema, models } from "mongoose";

const cashMovementSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    cashRegister: {
      type: Schema.Types.ObjectId,
      ref: "CashRegister",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },
    type: {
      type: String,
      enum: ["INGRESO", "EGRESO"],
      required: true,
    },
    source: {
      type: String,
      enum: ["MANUAL", "VENTA_EFECTIVO", "PAGO_FIADO", "AJUSTE", "CANCELACION_VENTA"],
      default: "MANUAL",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const CashMovement =
  models.CashMovement || mongoose.model("CashMovement", cashMovementSchema);