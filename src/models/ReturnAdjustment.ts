import mongoose, { Schema, models } from "mongoose";

const returnAdjustmentSchema = new Schema(
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
    paymentMethod: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    affectsCashRegister: {
      type: Boolean,
      default: false,
    },
    cashRegister: {
      type: Schema.Types.ObjectId,
      ref: "CashRegister",
      default: null,
    },
  },
  { timestamps: true }
);

export const ReturnAdjustment =
  models.ReturnAdjustment ||
  mongoose.model("ReturnAdjustment", returnAdjustmentSchema);