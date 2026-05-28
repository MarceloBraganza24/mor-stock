import mongoose, { Schema, models } from "mongoose";

const promotionSchema = new Schema(
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

    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_PRICE", "BUY_X_PAY_Y"],
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    fixedPrice: {
      type: Number,
      default: 0,
    },

    buyQuantity: {
      type: Number,
      default: 0,
    },

    payQuantity: {
      type: Number,
      default: 0,
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Promotion =
  models.Promotion || mongoose.model("Promotion", promotionSchema);