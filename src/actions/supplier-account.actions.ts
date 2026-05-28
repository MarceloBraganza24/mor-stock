"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from "@/models/Supplier";
import { SupplierMovement } from "@/models/SupplierMovement";
import { createAuditLog } from "@/lib/audit";

export async function getSupplierAccounts() {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const suppliers = await Supplier.find({
    store: session.user.store!,
    isActive: true,
    deletedAt: null,
  }).sort({ balance: -1, name: 1 });

  return JSON.parse(JSON.stringify(suppliers));
}

export async function getSupplierMovements(supplierId: string) {
  const session = await requireRoles(["OWNER", "STOCKER"]);

  await connectDB();

  const movements = await SupplierMovement.find({
    store: session.user.store!,
    supplier: supplierId,
  })
    .populate("user", "name role")
    .populate("purchase", "_id total status")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(movements));
}

export async function addSupplierDebt(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const supplierId = String(formData.get("supplierId") || "");
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "").trim();

  if (!supplierId) {
    return {
      success: false,
      error: "Seleccioná un proveedor.",
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: "El importe debe ser mayor a 0.",
    };
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    store: session.user.store!,
  });

  if (!supplier) {
    return {
      success: false,
      error: "Proveedor no encontrado.",
    };
  }

  supplier.balance = Number(supplier.balance || 0) + amount;

  await supplier.save();

  await SupplierMovement.create({
    store: session.user.store!,
    supplier: supplier._id,
    type: "DEBT",
    amount,
    description: description || "Deuda cargada manualmente",
    user: session.user.id,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "ADD_SUPPLIER_DEBT",
    entity: "Supplier",
    entityId: supplier._id.toString(),
    description: `Agregó deuda a proveedor ${supplier.name}`,
    metadata: {
      amount,
    },
  });

  revalidatePath("/proveedores/cuentas");
  revalidatePath("/compras");

  return {
    success: true,
    message: "Deuda cargada correctamente.",
  };
}

export async function registerSupplierPayment(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const supplierId = String(formData.get("supplierId") || "");
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "").trim();

  if (!supplierId) {
    return {
      success: false,
      error: "Seleccioná un proveedor.",
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: "El importe debe ser mayor a 0.",
    };
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    store: session.user.store!,
  });

  if (!supplier) {
    return {
      success: false,
      error: "Proveedor no encontrado.",
    };
  }

  supplier.balance = Math.max(0, Number(supplier.balance || 0) - amount);

  await supplier.save();

  await SupplierMovement.create({
    store: session.user.store!,
    supplier: supplier._id,
    type: "PAYMENT",
    amount,
    description: description || "Pago registrado",
    user: session.user.id,
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "REGISTER_SUPPLIER_PAYMENT",
    entity: "Supplier",
    entityId: supplier._id.toString(),
    description: `Registró pago a proveedor ${supplier.name}`,
    metadata: {
      amount,
    },
  });

  revalidatePath("/proveedores/cuentas");
  revalidatePath("/compras");

  return {
    success: true,
    message: "Pago registrado correctamente.",
  };
}