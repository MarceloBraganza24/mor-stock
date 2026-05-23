import mongoose, { Schema, models } from "mongoose";

const creditMovementSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
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
      enum: ["DEUDA", "PAGO", "AJUSTE"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR", "NINGUNO"],
      default: "NINGUNO",
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

export const CreditMovement =
  models.CreditMovement ||
  mongoose.model("CreditMovement", creditMovementSchema);