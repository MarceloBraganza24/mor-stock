import mongoose, { Schema, models } from "mongoose";

const internalNotificationSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "LOW_STOCK",
        "EXPIRING_PRODUCT",
        "CASH_OPEN_TOO_LONG",
        "SUBSCRIPTION_PENDING",
        "HIGH_DEBT",
        "DELIVERY_PENDING",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      enum: ["INFO", "WARNING", "DANGER"],
      default: "INFO",
    },

    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const InternalNotification =
  models.InternalNotification ||
  mongoose.model(
    "InternalNotification",
    internalNotificationSchema
  );