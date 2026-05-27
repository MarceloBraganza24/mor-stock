"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { Customer } from "@/models/Customer";
import { CreditMovement } from "@/models/CreditMovement";
import { ReturnAdjustment } from "@/models/ReturnAdjustment";
import { ProductBatch } from "@/models/ProductBatch";
import { createAuditLog } from "@/lib/audit";

const returnAdjustmentSchema = z.object({
  saleId: z.string().min(1, "Venta inválida"),
  reason: z.string().optional(),
});

export async function getReturnableSales() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const sales = await Sale.find({
    store: session.user.store,
    status: "COMPLETADA",
  })
    .populate("customer", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(sales));
}

export async function getReturnAdjustments() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const adjustments = await ReturnAdjustment.find({
    store: session.user.store,
  })
    .populate("sale", "_id total paymentMethod")
    .populate("user", "name role")
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(adjustments));
}

export async function createReturnAdjustment(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = returnAdjustmentSchema.parse({
    saleId: formData.get("saleId"),
    reason: formData.get("reason"),
  });

  await connectDB();

  const sale = await Sale.findOne({
    _id: parsed.saleId,
    store: session.user.store,
    status: "COMPLETADA",
  });

  if (!sale) {
    throw new Error("Venta no encontrada o ya devuelta/cancelada");
  }

  for (const item of sale.items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        store: session.user.store,
      },
      {
        $inc: { stock: item.quantity },
      }
    );

    if (item.batches && item.batches.length > 0) {
      for (const usedBatch of item.batches) {
        const batch = await ProductBatch.findOne({
          _id: usedBatch.batch,
          store: session.user.store,
          product: item.product,
        });

        if (batch) {
          batch.quantity += usedBatch.quantity;
          batch.isActive = true;
          await batch.save();
        }
      }
    }
  }

  let openCashRegister = null;
  let affectsCashRegister = false;

  if (sale.paymentMethod === "EFECTIVO") {
    openCashRegister = await CashRegister.findOne({
      store: session.user.store,
      status: "ABIERTA",
    });

    if (openCashRegister) {
      await CashMovement.create({
        store: session.user.store,
        cashRegister: openCashRegister._id,
        user: session.user.id,
        sale: sale._id,
        type: "EGRESO",
        source: "CANCELACION_VENTA",
        amount: sale.total,
        description: `Devolución histórica venta #${sale._id
          .toString()
          .slice(-6)}`,
      });

      openCashRegister.expectedAmount -= sale.total;
      await openCashRegister.save();

      affectsCashRegister = true;
    }
  }

  if (sale.paymentMethod === "FIADO" && sale.customer) {
    const customer = await Customer.findOne({
      _id: sale.customer,
      store: session.user.store,
    });

    if (customer) {
      customer.balance = Math.max(0, customer.balance - sale.total);
      await customer.save();

      await CreditMovement.create({
        store: session.user.store,
        customer: customer._id,
        user: session.user.id,
        sale: sale._id,
        type: "AJUSTE",
        paymentMethod: "NINGUNO",
        amount: sale.total,
        description: `Devolución venta fiada #${sale._id
          .toString()
          .slice(-6)}`,
      });
    }
  }

  await ReturnAdjustment.create({
    store: session.user.store,
    sale: sale._id,
    user: session.user.id,
    customer: sale.customer || null,
    paymentMethod: sale.paymentMethod,
    amount: sale.total,
    reason: parsed.reason || "",
    affectsCashRegister,
    cashRegister: openCashRegister?._id || null,
  });

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "CREATE_RETURN",
    entity: "ReturnAdjustment",
    entityId: sale._id.toString(),
    description: `Registró devolución de venta #${sale._id.toString().slice(-6)}`,
    metadata: {
      amount: sale.total,
      paymentMethod: sale.paymentMethod,
      reason: parsed.reason,
    },
  });

  sale.status = "DEVUELTA";
  await sale.save();

  revalidatePath("/devoluciones");
  revalidatePath("/ventas");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  revalidatePath("/caja");
  revalidatePath("/clientes");
}