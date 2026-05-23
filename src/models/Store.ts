import mongoose, { Schema, models } from "mongoose";

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "BASIC", "PRO"],
      default: "FREE",
    },
  },
  { timestamps: true }
);

export const Store = models.Store || mongoose.model("Store", storeSchema);