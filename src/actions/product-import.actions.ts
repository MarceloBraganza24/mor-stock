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
import { Supplier } from "@/models/Supplier";

function getValidRows(rows: ProductImportRow[], errors: any[]) {
  const invalidRowNumbers = new Set(errors.map((error) => error.rowNumber));

  return rows.filter((row) => !invalidRowNumbers.has(row.rowNumber));
}

export async function previewProductImport(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const file = formData.get("file") as File | null;

  if (!file) {
    return {
      success: false,
      error: "Seleccioná un archivo Excel o CSV.",
    };
  }

  const isValidExtension =
    file.name.endsWith(".xlsx") || file.name.endsWith(".csv");

  if (!isValidExtension) {
    return {
      success: false,
      error: "El archivo debe ser .xlsx o .csv.",
    };
  }

  await connectDB();

  const parsed = await parseProductImportFile(file);

  const barcodes = parsed.rows.map((row) => row.barcode).filter(Boolean);

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
  const validRows = getValidRows(parsed.rows, errors);

  return {
    success: true,
    rows: parsed.rows,
    validRows,
    errors,
    validCount: validRows.length,
    skippedCount: errors.length,
    totalCount: parsed.rows.length,
  };
}

export async function importProducts(rows: ProductImportRow[]) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  if (!rows.length) {
    return {
      success: false,
      error: "No hay productos válidos para importar.",
    };
  }

  const supplierNames = Array.from(
    new Set(rows.map((row) => row.supplierName).filter(Boolean))
  );

  const supplierDocs = await Promise.all(
    supplierNames.map(async (name) => {
      const supplier = await Supplier.findOneAndUpdate(
        {
          store: session.user.store!,
          name,
        },
        {
          $setOnInsert: {
            store: session.user.store!,
            name,
            isActive: true,
            deletedAt: null,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      return supplier;
    })
  );

  const supplierMap = new Map(
    supplierDocs.map((supplier: any) => [supplier.name, supplier._id])
  );

  const products = rows.map((row) => ({
    store: session.user.store!,
    name: row.name,
    barcode: row.barcode || "",
    category: row.category || "",
    brand: row.brand || "",
    supplier: row.supplierName ? supplierMap.get(row.supplierName) : null,
    costPrice: row.costPrice || 0,
    salePrice: row.salePrice || 0,
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