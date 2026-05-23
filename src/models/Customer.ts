import mongoose, { Schema, models } from "mongoose";

const customerSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Customer =
  models.Customer || mongoose.model("Customer", customerSchema);