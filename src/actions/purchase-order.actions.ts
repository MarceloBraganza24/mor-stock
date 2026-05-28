"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Supplier } from "@/models/Supplier";
import { PurchaseOrder } from "@/models/PurchaseOrder";
import { createAuditLog } from "@/lib/audit";
import { Purchase } from "@/models/Purchase";
import { SupplierMovement } from "@/models/SupplierMovement";

export async function getPurchaseOrderData() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const [suppliers, products, orders] = await Promise.all([
    Supplier.find({
      store: session.user.store!,
      isActive: true,
      deletedAt: null,
    }).sort({ name: 1 }),

    Product.find({
      store: session.user.store!,
      isActive: true,
      deletedAt: null,
    })
      .select("name barcode brand category costPrice stock")
      .sort({ name: 1 }),

    PurchaseOrder.find({
      store: session.user.store!,
    })
      .populate("supplier", "name")
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(80),
  ]);

  return JSON.parse(
    JSON.stringify({
      suppliers,
      products,
      orders,
    })
  );
}

export async function createPurchaseOrder(formData: FormData) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const supplierId = String(formData.get("supplierId") || "");
  const notes = String(formData.get("notes") || "").trim();

  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(Number);
  const costs = formData.getAll("estimatedCost").map(Number);

  if (!supplierId) {
    return {
      success: false,
      error: "Seleccioná un proveedor.",
    };
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    store: session.user.store!,
    isActive: true,
  });

  if (!supplier) {
    return {
      success: false,
      error: "Proveedor no encontrado.",
    };
  }

  const itemsInput = productIds
    .map((productId, index) => ({
      productId,
      quantity: Number(quantities[index] || 0),
      estimatedCost: Number(costs[index] || 0),
    }))
    .filter((item) => item.productId && item.quantity > 0);

  if (itemsInput.length === 0) {
    return {
      success: false,
      error: "Agregá al menos un producto.",
    };
  }

  const products = await Product.find({
    _id: { $in: itemsInput.map((item) => item.productId) },
    store: session.user.store!,
    isActive: true,
  });

  const productMap = new Map(
    products.map((product: any) => [product._id.toString(), product])
  );

  const items = itemsInput.map((item) => {
    const product: any = productMap.get(item.productId);

    if (!product) {
      throw new Error("Producto inválido en la orden.");
    }

    const quantity = Number(item.quantity || 0);
    const estimatedCost =
      Number(item.estimatedCost || 0) || Number(product.costPrice || 0);

    return {
      product: product._id,
      name: product.name,
      quantity,
      estimatedCost,
      subtotal: quantity * estimatedCost,
    };
  });

  const totalEstimated = items.reduce(
    (acc, item) => acc + Number(item.subtotal || 0),
    0
  );

  const order = await PurchaseOrder.create({
    store: session.user.store!,
    supplier: supplier._id,
    items,
    status: "DRAFT",
    totalEstimated,
    notes,
    user: session.user.id,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "CREATE_PURCHASE_ORDER",
    entity: "PurchaseOrder",
    entityId: order._id.toString(),
    description: `Creó orden de compra para ${supplier.name}`,
    metadata: {
      totalEstimated,
      items: items.length,
    },
  });

  revalidatePath("/ordenes-compra");

  return {
    success: true,
    message: "Orden de compra creada correctamente.",
  };
}

export async function updatePurchaseOrderStatus(
  orderId: string,
  status: "DRAFT" | "SENT" | "CANCELLED"
) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const order = await PurchaseOrder.findOne({
    _id: orderId,
    store: session.user.store!,
  }).populate("supplier", "name");

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (order.status === "RECEIVED") {
    throw new Error("No se puede modificar una orden ya recibida.");
  }

  order.status = status;

  if (status === "SENT") {
    order.sentAt = new Date();
  }

  if (status === "CANCELLED") {
    order.cancelledAt = new Date();
  }

  await order.save();

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "UPDATE_PURCHASE_ORDER_STATUS",
    entity: "PurchaseOrder",
    entityId: order._id.toString(),
    description: `Cambió estado de orden de compra a ${status}`,
  });

  revalidatePath("/ordenes-compra");
}

export async function receivePurchaseOrder(orderId: string) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const order = await PurchaseOrder.findOne({
    _id: orderId,
    store: session.user.store!,
  }).populate("supplier", "name balance");

  if (!order) {
    throw new Error("Orden de compra no encontrada");
  }

  if (order.status === "RECEIVED") {
    throw new Error("La orden ya fue recibida");
  }

  if (order.status === "CANCELLED") {
    throw new Error("No se puede recibir una orden cancelada");
  }

  let total = 0;

  for (const item of order.items) {
    const product = await Product.findOne({
      _id: item.product,
      store: session.user.store!,
      isActive: true,
    });

    if (!product) continue;

    const quantity = Number(item.quantity || 0);
    const cost = Number(item.estimatedCost || 0);
    const subtotal = quantity * cost;

    product.stock = Number(product.stock || 0) + quantity;

    if (cost > 0) {
      product.costPrice = cost;
    }

    await product.save();

    total += subtotal;
  }

  const purchase = await Purchase.create({
    store: session.user.store!,
    supplier: order.supplier._id,
    user: session.user.id,
    items: order.items.map((item: any) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      unitCost: item.estimatedCost,
      subtotal: item.subtotal,
    })),
    total,
    paymentMethod: "CUENTA_CORRIENTE",
    status: "COMPLETADA",
    notes: `Compra generada desde orden #${order._id.toString().slice(-6)}`,
  });

  const supplier: any = order.supplier;

  supplier.balance = Number(supplier.balance || 0) + total;
  await supplier.save();

  await SupplierMovement.create({
    store: session.user.store!,
    supplier: supplier._id,
    type: "DEBT",
    amount: total,
    description: `Compra recibida desde orden #${order._id.toString().slice(-6)}`,
    purchase: purchase._id,
    user: session.user.id,
  });

  order.status = "RECEIVED";
  order.receivedAt = new Date();

  await order.save();

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "RECEIVE_PURCHASE_ORDER",
    entity: "PurchaseOrder",
    entityId: order._id.toString(),
    description: `Recibió orden de compra #${order._id.toString().slice(-6)}`,
    metadata: {
      total,
      purchaseId: purchase._id.toString(),
    },
  });

  revalidatePath("/ordenes-compra");
  revalidatePath("/productos");
  revalidatePath("/compras");
  revalidatePath("/proveedores/cuentas");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Orden recibida correctamente. Stock actualizado.",
  };
}