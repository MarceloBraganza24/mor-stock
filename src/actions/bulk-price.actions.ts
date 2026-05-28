"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { createAuditLog } from "@/lib/audit";

type BulkPriceInput = {
  filterType: "ALL" | "CATEGORY" | "BRAND";
  filterValue?: string;
  percentage: number;
  roundTo: number;
};

function roundPrice(price: number, roundTo: number) {
  if (!roundTo || roundTo <= 0) return price;

  return Math.ceil(price / roundTo) * roundTo;
}

export async function applyBulkPriceUpdate(input: BulkPriceInput) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const percentage = Number(input.percentage);
  const roundTo = Number(input.roundTo || 1);

  if (!Number.isFinite(percentage) || percentage === 0) {
    return {
      success: false,
      error: "Ingresá un porcentaje válido.",
    };
  }

  const filter: any = {
    store: session.user.store!,
    isActive: true,
  };

  if (input.filterType === "CATEGORY") {
    if (!input.filterValue) {
      return {
        success: false,
        error: "Seleccioná una categoría.",
      };
    }

    filter.category = input.filterValue;
  }

  if (input.filterType === "BRAND") {
    if (!input.filterValue) {
      return {
        success: false,
        error: "Seleccioná una marca.",
      };
    }

    filter.brand = input.filterValue;
  }

  const products = await Product.find(filter);

  if (products.length === 0) {
    return {
      success: false,
      error: "No se encontraron productos para actualizar.",
    };
  }

  const factor = 1 + percentage / 100;

  const operations = products.map((product: any) => {
    const currentPrice = Number(product.salePrice || 0);
    const newPrice = roundPrice(currentPrice * factor, roundTo);

    return {
      updateOne: {
        filter: {
          _id: product._id,
          store: session.user.store!,
        },
        update: {
          $set: {
            salePrice: newPrice,
          },
        },
      },
    };
  });

  await Product.bulkWrite(operations);

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "BULK_PRICE_UPDATE",
    entity: "Product",
    description: `Actualizó precios masivamente (${percentage}%)`,
    metadata: {
      filterType: input.filterType,
      filterValue: input.filterValue || "",
      percentage,
      roundTo,
      productsUpdated: products.length,
    },
  });

  revalidatePath("/productos");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `${products.length} productos actualizados correctamente.`,
  };
}