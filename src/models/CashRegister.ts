import mongoose, { Schema, models } from "mongoose";

const cashRegisterSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    openedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    openingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    closingAmount: {
      type: Number,
      default: null,
    },
    expectedAmount: {
      type: Number,
      default: 0,
    },
    difference: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ABIERTA", "CERRADA", "REVISADA"],
      default: "ABIERTA",
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const CashRegister =
  models.CashRegister || mongoose.model("CashRegister", cashRegisterSchema);