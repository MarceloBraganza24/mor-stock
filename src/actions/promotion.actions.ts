"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Promotion } from "@/models/Promotion";
import { Product } from "@/models/Product";
import { createAuditLog } from "@/lib/audit";

export async function getPromotions() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  return JSON.parse(
    JSON.stringify(
      await Promotion.find({
        store: session.user.store!,
        isActive: true,
        deletedAt: null,
      })
        .populate("product", "name barcode salePrice")
        .sort({ createdAt: -1 })
    )
  );
}

export async function getPromotionProducts() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  return JSON.parse(
    JSON.stringify(
      await Product.find({
        store: session.user.store!,
        isActive: true,
        deletedAt: null,
      })
        .select("name barcode category brand salePrice")
        .sort({ name: 1 })
    )
  );
}

export async function createPromotion(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "");
  const scope = String(formData.get("scope") || "PRODUCT");

  const product = String(formData.get("product") || "");
  const category = String(formData.get("category") || "").trim();
  const brand = String(formData.get("brand") || "").trim();

  const percentage = Number(formData.get("percentage") || 0);
  const fixedPrice = Number(formData.get("fixedPrice") || 0);
  const buyQuantity = Number(formData.get("buyQuantity") || 0);
  const payQuantity = Number(formData.get("payQuantity") || 0);

  const startsAt = String(formData.get("startsAt") || "");
  const endsAt = String(formData.get("endsAt") || "");

  if (!name) {
    return {
      success: false,
      error: "Ingresá un nombre para la promoción.",
    };
  }

  if (!["PERCENTAGE", "FIXED_PRICE", "BUY_X_PAY_Y"].includes(type)) {
    return {
      success: false,
      error: "Tipo de promoción inválido.",
    };
  }

  if (scope === "PRODUCT" && !product) {
    return {
      success: false,
      error: "Seleccioná un producto.",
    };
  }

  if (scope === "CATEGORY" && !category) {
    return {
      success: false,
      error: "Ingresá una categoría.",
    };
  }

  if (scope === "BRAND" && !brand) {
    return {
      success: false,
      error: "Ingresá una marca.",
    };
  }

  if (type === "PERCENTAGE" && percentage <= 0) {
    return {
      success: false,
      error: "El porcentaje debe ser mayor a 0.",
    };
  }

  if (type === "FIXED_PRICE" && fixedPrice <= 0) {
    return {
      success: false,
      error: "El precio fijo debe ser mayor a 0.",
    };
  }

  if (type === "BUY_X_PAY_Y") {
    if (buyQuantity <= 0 || payQuantity <= 0 || payQuantity >= buyQuantity) {
      return {
        success: false,
        error: "Configurá correctamente la promo. Ej: compra 3 y paga 2.",
      };
    }
  }

  const promotion = await Promotion.create({
    store: session.user.store!,
    name,
    type,
    product: scope === "PRODUCT" ? product : null,
    category: scope === "CATEGORY" ? category : "",
    brand: scope === "BRAND" ? brand : "",
    percentage,
    fixedPrice,
    buyQuantity,
    payQuantity,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    isActive: true,
    deletedAt: null,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "CREATE_PROMOTION",
    entity: "Promotion",
    entityId: promotion._id.toString(),
    description: `Creó promoción ${name}`,
  });

  revalidatePath("/promociones");
  revalidatePath("/ventas");

  return {
    success: true,
    message: "Promoción creada correctamente.",
  };
}

export async function deletePromotion(promotionId: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const promotion = await Promotion.findOne({
    _id: promotionId,
    store: session.user.store!,
  });

  if (!promotion) {
    throw new Error("Promoción no encontrada");
  }

  promotion.isActive = false;
  promotion.deletedAt = new Date();

  await promotion.save();

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "DELETE_PROMOTION",
    entity: "Promotion",
    entityId: promotion._id.toString(),
    description: `Eliminó promoción ${promotion.name}`,
  });

  revalidatePath("/promociones");
  revalidatePath("/ventas");
}

export async function getActivePromotions() {
  const session = await requireRoles([
    "OWNER",
    "CASHIER",
  ]);

  await connectDB();

  const promotions = await Promotion.find({
    store: session.user.store!,
    isActive: true,
    deletedAt: null,
  })
    .populate(
      "product",
      "name category brand"
    )
    .sort({ createdAt: -1 });

  return JSON.parse(
    JSON.stringify(promotions)
  );
}