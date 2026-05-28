import mongoose, { Schema, models } from "mongoose";

const productSchema = new Schema(
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
    barcode: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    minStock: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  barcode: "text",
  category: "text",
  brand: "text",
});

export const Product =
  models.Product || mongoose.model("Product", productSchema);