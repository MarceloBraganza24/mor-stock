import mongoose, { Schema, models } from "mongoose";

const purchaseOrderSchema = new Schema(
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
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
        },

        estimatedCost: {
          type: Number,
          default: 0,
        },

        subtotal: {
          type: Number,
          default: 0,
        },
      },
    ],

    status: {
      type: String,
      enum: ["DRAFT", "SENT", "RECEIVED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

    totalEstimated: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    receivedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
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

export const PurchaseOrder =
  models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema);