"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Combo } from "@/models/Combo";
import { Product } from "@/models/Product";
import { createAuditLog } from "@/lib/audit";

export async function getCombos() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  return JSON.parse(
    JSON.stringify(
      await Combo.find({
        store: session.user.store!,
        isActive: true,
        deletedAt: null,
      })
        .populate("items.product", "name salePrice stock")
        .sort({ createdAt: -1 })
    )
  );
}

export async function getComboProducts() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  return JSON.parse(
    JSON.stringify(
      await Product.find({
        store: session.user.store!,
        isActive: true,
        deletedAt: null,
      })
        .select("name salePrice stock")
        .sort({ name: 1 })
    )
  );
}

export async function createCombo(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const name = String(formData.get("name") || "").trim();

  const comboPrice = Number(
    formData.get("comboPrice") || 0
  );

  const products = formData.getAll("product");
  const quantities = formData.getAll("quantity");

  if (!name) {
    return {
      success: false,
      error: "Ingresá un nombre.",
    };
  }

  if (comboPrice <= 0) {
    return {
      success: false,
      error: "Ingresá un precio válido.",
    };
  }

  const items = products
    .map((productId, index) => ({
      product: String(productId),
      quantity: Number(quantities[index] || 1),
    }))
    .filter((item) => item.product);

  if (items.length === 0) {
    return {
      success: false,
      error: "Agregá productos al combo.",
    };
  }

  const combo = await Combo.create({
    store: session.user.store!,
    name,
    items,
    comboPrice,
    isActive: true,
    deletedAt: null,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "CREATE_COMBO",
    entity: "Combo",
    entityId: combo._id.toString(),
    description: `Creó combo ${name}`,
  });

  revalidatePath("/combos");
  revalidatePath("/ventas");

  return {
    success: true,
    message: "Combo creado correctamente.",
  };
}

export async function deleteCombo(comboId: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const combo = await Combo.findOne({
    _id: comboId,
    store: session.user.store!,
  });

  if (!combo) {
    throw new Error("Combo no encontrado");
  }

  combo.isActive = false;
  combo.deletedAt = new Date();

  await combo.save();

  revalidatePath("/combos");
}