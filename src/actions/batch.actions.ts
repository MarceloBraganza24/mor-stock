"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { productBatchSchema } from "@/lib/validations";
import { Product } from "@/models/Product";
import { ProductBatch } from "@/models/ProductBatch";
import { StockMovement } from "@/models/StockMovement";

export async function createProductBatch(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const parsed = productBatchSchema.parse({
    productId: formData.get("productId"),
    batchCode: formData.get("batchCode"),
    quantity: formData.get("quantity"),
    expirationDate: formData.get("expirationDate"),
  });

  await connectDB();

  const product = await Product.findOne({
    _id: parsed.productId,
    store: session.user.store,
    isActive: true,
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  const previousStock = product.stock;
  const newStock = previousStock + parsed.quantity;

  await ProductBatch.create({
    store: session.user.store,
    product: product._id,
    batchCode: parsed.batchCode || "",
    quantity: parsed.quantity,
    expirationDate: new Date(parsed.expirationDate),
  });

  product.stock = newStock;
  await product.save();

  await StockMovement.create({
    store: session.user.store,
    product: product._id,
    user: session.user.id,
    type: "SUMA",
    quantity: parsed.quantity,
    previousStock,
    newStock,
    reason: "Ingreso por lote con vencimiento",
  });

  revalidatePath("/vencimientos");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
}

export async function getExpirationAlerts() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 30);
  warningDate.setHours(23, 59, 59, 999);

  const batches = await ProductBatch.find({
    store: session.user.store,
    isActive: true,
    quantity: { $gt: 0 },
    expirationDate: { $lte: warningDate },
  })
    .populate("product", "name barcode category")
    .sort({ expirationDate: 1 });

  return JSON.parse(JSON.stringify(batches));
}

export async function getProductBatches() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const batches = await ProductBatch.find({
    store: session.user.store,
    isActive: true,
  })
    .populate("product", "name barcode category")
    .sort({ expirationDate: 1 });

  return JSON.parse(JSON.stringify(batches));
}