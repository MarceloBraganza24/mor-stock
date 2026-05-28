import mongoose, { Schema, models } from "mongoose";

const supplierMovementSchema = new Schema(
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
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["DEBT", "PAYMENT", "ADJUSTMENT"],
      required: true,
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

    purchase: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SupplierMovement =
  models.SupplierMovement ||
  mongoose.model("SupplierMovement", supplierMovementSchema);