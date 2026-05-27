import mongoose, { Schema, models } from "mongoose";

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    city: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    businessType: { type: String, default: "Mercado", trim: true },
    currency: { type: String, default: "ARS" },
    logoUrl: { type: String, default: "" },

    openingHours: {
      type: String,
      default: "",
      trim: true,
    },

    expirationAlertDays: {
      type: Number,
      default: 30,
    },

    defaultDeliveryFee: {
      type: Number,
      default: 0,
    },

    plan: {
      type: String,
      enum: ["FREE", "BASIC", "PRO"],
      default: "FREE",
    },

    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },

    onboarding: {
      storeCompleted: { type: Boolean, default: false },
      firstProductCreated: { type: Boolean, default: false },
      firstCashOpened: { type: Boolean, default: false },
      completed: { type: Boolean, default: false },
    },

    subscription: {
      mercadoPagoPreapprovalId: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["NONE", "PENDING", "ACTIVE", "PAUSED", "CANCELLED"],
        default: "NONE",
      },
      currentPeriodStart: {
        type: Date,
        default: null,
      },
      currentPeriodEnd: {
        type: Date,
        default: null,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Store = models.Store || mongoose.model("Store", storeSchema);