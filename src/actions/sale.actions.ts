"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { Customer } from "@/models/Customer";
import { CreditMovement } from "@/models/CreditMovement";
import { ProductBatch } from "@/models/ProductBatch";
import { getActionError } from "@/lib/action-response";
import { createAuditLog } from "@/lib/audit";

const createSaleSchema = z.object({
  paymentMethod: z.enum([
    "EFECTIVO",
    "TRANSFERENCIA",
    "DEBITO",
    "CREDITO",
    "QR",
    "FIADO",
  ]),
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "La venta debe tener al menos un producto"),
});

const salesHistorySchema = z.object({
  paymentMethod: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function createSale(input: unknown) {
  try {
    const session = await requireRoles(["OWNER", "CASHIER"]);

    const parsed = createSaleSchema.parse(input);

    await connectDB();

    let customer = null;

    if (parsed.paymentMethod === "FIADO") {
      if (!parsed.customerId) {
        return { error: "Seleccioná un cliente para vender fiado." };
      }

      customer = await Customer.findOne({
        _id: parsed.customerId,
        store: session.user.store!,
        isActive: true,
      });

      if (!customer) {
        return { error: "Cliente no encontrado." };
      }
    }

    const saleItems = [];
    let total = 0;
    let profit = 0;

    for (const item of parsed.items) {
      const product = await Product.findOne({
        _id: item.productId,
        store: session.user.store!,
        isActive: true,
      });

      if (!product) {
        return { error: "Producto no encontrado." };
      }

      if (product.stock < item.quantity) {
        return {
          error: `Stock insuficiente para ${product.name}. Stock actual: ${product.stock}`,
        };
      }

      const subtotal = product.salePrice * item.quantity;
      const itemProfit = (product.salePrice - product.costPrice) * item.quantity;

      const usedBatches = [];
      let remainingToDiscount = item.quantity;

      const batches = await ProductBatch.find({
        store: session.user.store!,
        product: product._id,
        isActive: true,
        quantity: { $gt: 0 },
      }).sort({ expirationDate: 1 });

      for (const batch of batches) {
        if (remainingToDiscount <= 0) break;

        const discount = Math.min(batch.quantity, remainingToDiscount);

        batch.quantity -= discount;
        remainingToDiscount -= discount;

        usedBatches.push({
          batch: batch._id,
          batchCode: batch.batchCode || "",
          expirationDate: batch.expirationDate,
          quantity: discount,
        });

        if (batch.quantity <= 0) {
          batch.isActive = false;
        }

        await batch.save();
      }

      product.stock -= item.quantity;
      await product.save();

      saleItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        subtotal,
        batches: usedBatches,
      });

      total += subtotal;
      profit += itemProfit;
    }

    const sale = await Sale.create({
      store: session.user.store!,
      user: session.user.id,
      customer: customer?._id || null,
      items: saleItems,
      total,
      profit,
      paymentMethod: parsed.paymentMethod,
    });

    await createAuditLog({
      store: session.user.store!,
      user: session.user.id,
      action: "CREATE_SALE",
      entity: "Sale",
      entityId: sale._id.toString(),
      description: `Registró venta #${sale._id.toString().slice(-6)}`,
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
          sale: sale._id,
          type: "INGRESO",
          source: "VENTA_EFECTIVO",
          amount: total,
          description: `Venta en efectivo #${sale._id.toString().slice(-6)}`,
        });

        openCashRegister.expectedAmount += total;
        await openCashRegister.save();
      }
    }

    if (parsed.paymentMethod === "FIADO" && customer) {
      customer.balance += total;
      await customer.save();

      await CreditMovement.create({
        store: session.user.store!,
        customer: customer._id,
        user: session.user.id,
        sale: sale._id,
        type: "DEUDA",
        paymentMethod: "NINGUNO",
        amount: total,
        description: `Venta fiada #${sale._id.toString().slice(-6)}`,
      });
    }

    revalidatePath("/ventas");
    revalidatePath("/productos");
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/clientes");

    return {
      success: true,
      message: "Venta registrada correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: getActionError(error),
    };
  }
}

export async function getSaleTicket(saleId: string) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  if (!saleId) {
    throw new Error("Venta inválida");
  }

  await connectDB();

  const sale = await Sale.findOne({
    _id: saleId,
    store: session.user.store!,
  })
    .populate("customer", "name")
    .populate("user", "name role")
    .populate("store", "name city address phone currency logoUrl");

  if (!sale) {
    throw new Error("Venta no encontrada");
  }

  return JSON.parse(JSON.stringify(sale));
}

export async function getTodaySales() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const sales = await Sale.find({
    store: session.user.store!,
    createdAt: { $gte: start, $lte: end },
    status: "COMPLETADA",
  })
    .populate("customer", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(sales));
}

export async function getSalesHistory(filters?: {
  paymentMethod?: string;
  from?: string;
  to?: string;
}) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = salesHistorySchema.parse(filters || {});

  await connectDB();

  const query: any = {
    store: session.user.store!,
    status: "COMPLETADA",
  };

  if (parsed.paymentMethod && parsed.paymentMethod !== "TODOS") {
    query.paymentMethod = parsed.paymentMethod;
  }

  if (parsed.from || parsed.to) {
    query.createdAt = {};

    if (parsed.from) {
      const fromDate = new Date(parsed.from);
      fromDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = fromDate;
    }

    if (parsed.to) {
      const toDate = new Date(parsed.to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  const sales = await Sale.find(query)
    .populate("customer", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(sales));
}

export async function cancelSale(saleId: string) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  if (!saleId) {
    throw new Error("Venta inválida");
  }

  await connectDB();

  const sale = await Sale.findOne({
    _id: saleId,
    store: session.user.store!,
    status: "COMPLETADA",
  });

  if (!sale) {
    throw new Error("Venta no encontrada o ya cancelada");
  }

  for (const item of sale.items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        store: session.user.store!,
      },
      {
        $inc: { stock: item.quantity },
      }
    );
    if (item.batches && item.batches.length > 0) {
      for (const usedBatch of item.batches) {
        const batch = await ProductBatch.findOne({
          _id: usedBatch.batch,
          store: session.user.store!,
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

  if (sale.paymentMethod === "EFECTIVO") {
    const openCashRegister = await CashRegister.findOne({
      store: session.user.store!,
      status: "ABIERTA",
    });

    if (openCashRegister) {
      await CashMovement.create({
        store: session.user.store!,
        cashRegister: openCashRegister._id,
        user: session.user.id,
        sale: sale._id,
        type: "EGRESO",
        source: "CANCELACION_VENTA",
        amount: sale.total,
        description: `Cancelación venta #${sale._id.toString().slice(-6)}`,
      });

      openCashRegister.expectedAmount -= sale.total;
      await openCashRegister.save();
    }
  }

  if (sale.paymentMethod === "FIADO" && sale.customer) {
    const customer = await Customer.findOne({
      _id: sale.customer,
      store: session.user.store!,
    });

    if (customer) {
      customer.balance = Math.max(0, customer.balance - sale.total);
      await customer.save();

      await CreditMovement.create({
        store: session.user.store!,
        customer: customer._id,
        user: session.user.id,
        sale: sale._id,
        type: "AJUSTE",
        paymentMethod: "NINGUNO",
        amount: sale.total,
        description: `Cancelación venta fiada #${sale._id
          .toString()
          .slice(-6)}`,
      });
    }
  }

  
  sale.status = "CANCELADA";
  await sale.save();
  
  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "CANCEL_SALE",
    entity: "Sale",
    entityId: sale._id.toString(),
    description: `Canceló venta #${sale._id.toString().slice(-6)}`,
    metadata: {
      total: sale.total,
      paymentMethod: sale.paymentMethod,
    },
  });
  
  revalidatePath("/ventas");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  revalidatePath("/caja");
  revalidatePath("/clientes");
}