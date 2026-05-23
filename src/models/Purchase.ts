import mongoose, { Schema, models } from "mongoose";

const purchaseItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const purchaseSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [purchaseItemSchema],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR", "CUENTA_CORRIENTE"],
      default: "EFECTIVO",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["COMPLETADA", "CANCELADA"],
      default: "COMPLETADA",
    },
  },
  { timestamps: true }
);

export const Purchase =
  models.Purchase || mongoose.model("Purchase", purchaseSchema);