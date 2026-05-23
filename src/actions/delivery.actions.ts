"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { deliveryOrderSchema } from "@/lib/validations";
import { DeliveryOrder } from "@/models/DeliveryOrder";

export async function createDeliveryOrder(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = deliveryOrderSchema.parse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    deliveryFee: formData.get("deliveryFee"),
  });

  await connectDB();

  await DeliveryOrder.create({
    store: session.user.store,
    requestedBy: session.user.id,
    ...parsed,
    status: "PENDIENTE",
  });

  revalidatePath("/envios");
  revalidatePath("/motomandado");
}

export async function getStoreDeliveryOrders() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const orders = await DeliveryOrder.find({
    store: session.user.store,
  })
    .populate("store", "name city")
    .populate("requestedBy", "name role")
    .populate("deliveryUser", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(orders));
}

export async function getAvailableDeliveryOrders() {
  const session = await requireRoles(["DELIVERY"]);

  await connectDB();

  const orders = await DeliveryOrder.find({
    status: { $in: ["PENDIENTE", "TOMADO", "EN_CAMINO"] },
    $or: [{ deliveryUser: null }, { deliveryUser: session.user.id }],
  })
    .populate("store", "name city")
    .populate("requestedBy", "name role")
    .populate("deliveryUser", "name")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(orders));
}

export async function takeDeliveryOrder(orderId: string) {
  const session = await requireRoles(["DELIVERY"]);

  await connectDB();

  await DeliveryOrder.findOneAndUpdate(
    {
      _id: orderId,
      status: "PENDIENTE",
      deliveryUser: null,
    },
    {
      deliveryUser: session.user.id,
      status: "TOMADO",
    }
  );

  revalidatePath("/motomandado");
  revalidatePath("/envios");
}

export async function updateDeliveryStatus(
  orderId: string,
  status: "EN_CAMINO" | "ENTREGADO" | "CANCELADO"
) {
  const session = await requireRoles(["DELIVERY"]);

  await connectDB();

  await DeliveryOrder.findOneAndUpdate(
    {
      _id: orderId,
      deliveryUser: session.user.id,
      status: { $in: ["TOMADO", "EN_CAMINO"] },
    },
    {
      status,
    }
  );

  revalidatePath("/motomandado");
  revalidatePath("/envios");
}

export async function cancelDeliveryOrder(orderId: string) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  await DeliveryOrder.findOneAndUpdate(
    {
      _id: orderId,
      store: session.user.store,
      status: { $ne: "ENTREGADO" },
    },
    {
      status: "CANCELADO",
    }
  );

  revalidatePath("/envios");
  revalidatePath("/motomandado");
}