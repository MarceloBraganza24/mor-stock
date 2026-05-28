"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import {
  purchaseSchema,
  supplierSchema,
} from "@/lib/validations";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";
import { Supplier } from "@/models/Supplier";
import { StockMovement } from "@/models/StockMovement";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { assertFeatureEnabled } from "@/lib/plan-utils";
import { getActionError } from "@/lib/action-response";
import { createAuditLog } from "@/lib/audit";

export async function getSuppliers() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  await assertFeatureEnabled(session.user.store, "purchases");

  const suppliers = await Supplier.find({
    store: session.user.store!,
    isActive: true,
  }).sort({ name: 1 });

  return JSON.parse(JSON.stringify(suppliers));
}

export async function createSupplier(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });

  await connectDB();

  await Supplier.create({
    store: session.user.store!,
    ...parsed,
  });

  revalidatePath("/compras");
}

export async function deleteSupplier(supplierId: string) {
  const session = await requireRoles(["OWNER"]);

  if (!supplierId) {
    throw new Error("Proveedor inválido");
  }

  await connectDB();

  await Supplier.findOneAndUpdate(
    {
      _id: supplierId,
      store: session.user.store!,
    },
    {
      isActive: false,
    }
  );

  revalidatePath("/compras");
}

export async function getPurchases() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  await assertFeatureEnabled(session.user.store, "purchases");

  const purchases = await Purchase.find({
    store: session.user.store!,
  })
    .populate("supplier", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(purchases));
}

export async function createPurchase(input: unknown) {
  try {
    const session = await requireRoles(["OWNER", "STOCKER"]);

    const parsed = purchaseSchema.parse(input);

    await connectDB();

    await assertFeatureEnabled(session.user.store, "purchases");

    let supplier = null;

    if (parsed.supplierId) {
      supplier = await Supplier.findOne({
        _id: parsed.supplierId,
        store: session.user.store!,
        isActive: true,
      });

      if (!supplier) {
        return { success: false, error: "Proveedor no encontrado." };
      }
    }

    const purchaseItems = [];
    let total = 0;

    for (const item of parsed.items) {
      const product = await Product.findOne({
        _id: item.productId,
        store: session.user.store!,
        isActive: true,
      });

      if (!product) {
        return { success: false, error: "Producto no encontrado." };
      }

      const previousStock = product.stock;
      const newStock = previousStock + item.quantity;
      const subtotal = item.quantity * item.unitCost;

      product.stock = newStock;
      product.costPrice = item.unitCost;
      await product.save();

      await StockMovement.create({
        store: session.user.store!,
        product: product._id,
        user: session.user.id,
        type: "SUMA",
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: "Compra de mercadería",
      });

      purchaseItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal,
      });

      total += subtotal;
    }

    const purchase = await Purchase.create({
      store: session.user.store!,
      supplier: supplier?._id || null,
      user: session.user.id,
      items: purchaseItems,
      total,
      paymentMethod: parsed.paymentMethod,
      notes: parsed.notes || "",
    });

    await createAuditLog({
      store: session.user.store!,
      user: session.user.id,
      action: "CREATE_PURCHASE",
      entity: "Purchase",
      entityId: purchase._id.toString(),
      description: `Registró compra #${purchase._id.toString().slice(-6)}`,
      metadata: {
        total,
        paymentMethod: parsed.paymentMethod,
      },
    });

    if (parsed.paymentMethod === "EFECTIVO") {
      const openCashRegister = await CashRegister.findOne({
        store: session.user.store!,
        status: "ABIERTA",
      });

      if (openCashRegister) {
        await CashMovement.create({
          store: session.user.store!,
          cashRegister: openCashRegister._id,
          user: session.user.id,
          type: "EGRESO",
          source: "COMPRA_EFECTIVO",
          amount: total,
          description: `Compra en efectivo #${purchase._id
            .toString()
            .slice(-6)}`,
        });

        openCashRegister.expectedAmount -= total;
        await openCashRegister.save();
      }
    }

    revalidatePath("/compras");
    revalidatePath("/productos");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Compra registrada correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: getActionError(error),
    };
  }
}

export async function cancelPurchase(purchaseId: string) {
  const session = await requireRoles(["OWNER"]);

  if (!purchaseId) {
    throw new Error("Compra inválida");
  }

  await connectDB();

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    store: session.user.store!,
    status: "COMPLETADA",
  });

  if (!purchase) {
    throw new Error("Compra no encontrada o ya cancelada");
  }

  for (const item of purchase.items) {
    const product = await Product.findOne({
      _id: item.product,
      store: session.user.store!,
      isActive: true,
    });

    if (product) {
      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - item.quantity);

      product.stock = newStock;
      await product.save();

      await StockMovement.create({
        store: session.user.store!,
        product: product._id,
        user: session.user.id,
        type: "RESTA",
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: `Cancelación compra #${purchase._id.toString().slice(-6)}`,
      });
    }
  }

  purchase.status = "CANCELADA";
  await purchase.save();

  if (purchase.paymentMethod === "EFECTIVO") {
    const openCashRegister = await CashRegister.findOne({
      store: session.user.store!,
      status: "ABIERTA",
    });

    if (openCashRegister) {
      await CashMovement.create({
        store: session.user.store!,
        cashRegister: openCashRegister._id,
        user: session.user.id,
        type: "INGRESO",
        source: "AJUSTE",
        amount: purchase.total,
        description: `Cancelación compra efectivo #${purchase._id
          .toString()
          .slice(-6)}`,
      });

      openCashRegister.expectedAmount += purchase.total;
      await openCashRegister.save();
    }
  }

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "CANCEL_PURCHASE",
    entity: "Purchase",
    entityId: purchase._id.toString(),
    description: `Canceló compra #${purchase._id.toString().slice(-6)}`,
    metadata: {
      total: purchase.total,
    },
  });

  revalidatePath("/compras");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
}