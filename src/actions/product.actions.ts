"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { requireRoles } from "@/lib/auth-utils";
import { productSchema } from "@/lib/validations";
import { StockMovement } from "@/models/StockMovement";
import { stockAdjustmentSchema } from "@/lib/validations";

export async function getProducts(filters?: {
  query?: string;
  category?: string;
  lowStock?: string;
}) {
  const session = await requireRoles(["OWNER", "STOCKER", "CASHIER"]);

  await connectDB();

  const mongoQuery: any = {
    store: session.user.store,
    isActive: true,
  };

  if (filters?.query) {
    mongoQuery.$or = [
      { name: { $regex: filters.query, $options: "i" } },
      { barcode: { $regex: filters.query, $options: "i" } },
    ];
  }

  if (filters?.category && filters.category !== "TODAS") {
    mongoQuery.category = filters.category;
  }

  if (filters?.lowStock === "true") {
    mongoQuery.$expr = { $lte: ["$stock", "$minStock"] };
  }

  const products = await Product.find(mongoQuery).sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(products));
}

export async function getProductCategories() {
  const session = await requireRoles(["OWNER", "STOCKER", "CASHIER"]);

  await connectDB();

  const categories = await Product.distinct("category", {
    store: session.user.store,
    isActive: true,
  });

  return categories.filter(Boolean).sort();
}

export async function createProduct(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const parsed = productSchema.parse({
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    category: formData.get("category"),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    stock: formData.get("stock"),
    minStock: formData.get("minStock"),
  });

  await connectDB();

  await Product.create({
    store: session.user.store,
    ...parsed,
    category: parsed.category || "General",
  });

  revalidatePath("/productos");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const parsed = productSchema.parse({
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    category: formData.get("category"),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    stock: formData.get("stock"),
    minStock: formData.get("minStock"),
  });

  await connectDB();

  await Product.findOneAndUpdate(
    {
      _id: productId,
      store: session.user.store,
      isActive: true,
    },
    {
      ...parsed,
      category: parsed.category || "General",
    }
  );

  revalidatePath("/productos");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
}

export async function deleteProduct(productId: string) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  await Product.findOneAndUpdate(
    {
      _id: productId,
      store: session.user.store,
    },
    {
      isActive: false,
    }
  );

  revalidatePath("/productos");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
}

export async function adjustProductStock(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const parsed = stockAdjustmentSchema.parse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
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
  let newStock = previousStock;

  if (parsed.type === "SUMA") {
    newStock = previousStock + parsed.quantity;
  }

  if (parsed.type === "RESTA") {
    newStock = Math.max(0, previousStock - parsed.quantity);
  }

  if (parsed.type === "AJUSTE") {
    newStock = parsed.quantity;
  }

  product.stock = newStock;
  await product.save();

  await StockMovement.create({
    store: session.user.store,
    product: product._id,
    user: session.user.id,
    type: parsed.type,
    quantity: parsed.quantity,
    previousStock,
    newStock,
    reason: parsed.reason || "",
  });

  revalidatePath("/productos");
  revalidatePath("/dashboard");
}

export async function getStockMovements() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const movements = await StockMovement.find({
    store: session.user.store,
  })
    .populate("product", "name barcode category")
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(movements));
}