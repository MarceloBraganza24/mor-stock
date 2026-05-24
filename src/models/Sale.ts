import mongoose, { Schema, models } from "mongoose";

const saleItemBatchSchema = new Schema(
  {
    batch: {
      type: Schema.Types.ObjectId,
      ref: "ProductBatch",
      required: true,
    },
    batchCode: {
      type: String,
      default: "",
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    batches: [saleItemBatchSchema],
  },
  { _id: false }
);

const saleSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    items: [saleItemSchema],
    total: { type: Number, required: true, default: 0 },
    profit: { type: Number, required: true, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR", "FIADO"],
      default: "EFECTIVO",
    },
    status: {
      type: String,
      enum: ["COMPLETADA", "CANCELADA", "DEVUELTA"],
      default: "COMPLETADA",
    },
  },
  { timestamps: true }
);

export const Sale = models.Sale || mongoose.model("Sale", saleSchema);