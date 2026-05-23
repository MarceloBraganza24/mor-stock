import mongoose, { Schema, models } from "mongoose";

const deliveryOrderSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDIENTE", "TOMADO", "EN_CAMINO", "ENTREGADO", "CANCELADO"],
      default: "PENDIENTE",
      index: true,
    },
  },
  { timestamps: true }
);

export const DeliveryOrder =
  models.DeliveryOrder ||
  mongoose.model("DeliveryOrder", deliveryOrderSchema);