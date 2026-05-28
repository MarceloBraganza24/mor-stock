"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import {
  parseProductImportFile,
  ProductImportRow,
} from "@/lib/product-import";
import { createAuditLog } from "@/lib/audit";

export async function previewProductImport(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const file = formData.get("file") as File | null;

  if (!file) {
    return {
      success: false,
      error: "Seleccioná un archivo Excel o CSV.",
    };
  }

  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  const isValidExtension =
    file.name.endsWith(".xlsx") || file.name.endsWith(".csv");

  if (!validTypes.includes(file.type) && !isValidExtension) {
    return {
      success: false,
      error: "El archivo debe ser .xlsx o .csv.",
    };
  }

  await connectDB();

  const parsed = await parseProductImportFile(file);

  const barcodes = parsed.rows
    .map((row) => row.barcode)
    .filter(Boolean);

  const existingProducts = await Product.find({
    store: session.user.store!,
    barcode: { $in: barcodes },
    isActive: true,
  }).select("barcode name");

  const existingBarcodes = new Set(
    existingProducts.map((product: any) => product.barcode)
  );

  const dbErrors = parsed.rows
    .filter((row) => row.barcode && existingBarcodes.has(row.barcode))
    .map((row) => ({
      rowNumber: row.rowNumber,
      field: "codigo",
      message: "Ya existe un producto con este código en el sistema.",
    }));

  const errors = [...parsed.errors, ...dbErrors];

  return {
    success: true,
    rows: parsed.rows,
    errors,
    validCount: parsed.rows.length - errors.length,
    totalCount: parsed.rows.length,
  };
}

export async function importProducts(rows: ProductImportRow[]) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  if (!rows.length) {
    return {
      success: false,
      error: "No hay productos para importar.",
    };
  }

  const products = rows.map((row) => ({
    store: session.user.store!,
    name: row.name,
    barcode: row.barcode || undefined,
    category: row.category || "",
    costPrice: row.costPrice || 0,
    salePrice: row.salePrice,
    stock: row.stock || 0,
    minStock: row.minStock || 0,
    isActive: true,
    deletedAt: null,
  }));

  await Product.insertMany(products, {
    ordered: false,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "IMPORT_PRODUCTS",
    entity: "Product",
    description: `Importó ${products.length} productos desde Excel/CSV`,
    metadata: {
      count: products.length,
    },
  });

  revalidatePath("/productos");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `${products.length} productos importados correctamente.`,
  };
}