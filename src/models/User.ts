import mongoose, { Schema, models } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "OWNER" | "CASHIER" | "STOCKER" | "DELIVERY";;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "OWNER", "CASHIER", "STOCKER", "DELIVERY"],
      default: "OWNER",
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model("User", userSchema);