import mongoose, { Schema, models } from "mongoose";

const stockMovementSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["SUMA", "RESTA", "AJUSTE"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const StockMovement =
  models.StockMovement || mongoose.model("StockMovement", stockMovementSchema);