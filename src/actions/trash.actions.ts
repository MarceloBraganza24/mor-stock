"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Supplier } from "@/models/Supplier";
import { User } from "@/models/User";
import { createAuditLog } from "@/lib/audit";

const models: any = {
  product: Product,
  customer: Customer,
  supplier: Supplier,
  employee: User,
};

export async function getTrashItems() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const [products, customers, suppliers, employees] = await Promise.all([
    Product.find({ store: session.user.store!, isActive: false }).sort({ updatedAt: -1 }),
    Customer.find({ store: session.user.store!, isActive: false }).sort({ updatedAt: -1 }),
    Supplier.find({ store: session.user.store!, isActive: false }).sort({ updatedAt: -1 }),
    User.find({
      store: session.user.store!,
      isActive: false,
      role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    }).sort({ updatedAt: -1 }),
  ]);

  return JSON.parse(
    JSON.stringify({
      products,
      customers,
      suppliers,
      employees,
    })
  );
}

export async function restoreTrashItem(type: string, id: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const Model = models[type];

  if (!Model) {
    throw new Error("Tipo inválido");
  }

  await Model.findOneAndUpdate(
    {
      _id: id,
      store: session.user.store!,
      isActive: false,
    },
    {
      isActive: true,
    }
  );

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "RESTORE_TRASH_ITEM",
    entity: type,
    entityId: id,
    description: `Restauró elemento de papelera: ${type}`,
  });

  revalidatePath("/papelera");
  revalidatePath("/productos");
  revalidatePath("/clientes");
  revalidatePath("/compras");
  revalidatePath("/empleados");
}

export async function permanentlyDeleteTrashItem(type: string, id: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const Model = models[type];

  if (!Model) {
    throw new Error("Tipo inválido");
  }

  await Model.findOneAndDelete({
    _id: id,
    store: session.user.store!,
    isActive: false,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "PERMANENT_DELETE_TRASH_ITEM",
    entity: type,
    entityId: id,
    description: `Eliminó permanentemente elemento: ${type}`,
  });

  revalidatePath("/papelera");
}