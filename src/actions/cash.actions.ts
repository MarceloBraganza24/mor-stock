"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { cashMovementSchema } from "@/lib/validations";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { Store } from "@/models/Store";
import { createAuditLog } from "@/lib/audit";

export async function getOpenCashRegister() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const cashRegister = await CashRegister.findOne({
    store: session.user.store,
    status: "ABIERTA",
  }).sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(cashRegister));
}

export async function getOpenCashMovements() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const cashRegister = await CashRegister.findOne({
    store: session.user.store,
    status: "ABIERTA",
  });

  if (!cashRegister) return [];

  const movements = await CashMovement.find({
    store: session.user.store,
    cashRegister: cashRegister._id,
  })
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(movements));
}

export async function getCashHistory() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const history = await CashRegister.find({
    store: session.user.store,
  })
    .populate("openedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(20);

  return JSON.parse(JSON.stringify(history));
}

export async function openCashRegister(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const openingAmount = Number(formData.get("openingAmount") || 0);

  if (openingAmount < 0) {
    throw new Error("El monto inicial no puede ser negativo");
  }

  await connectDB();

  const existingOpenCash = await CashRegister.findOne({
    store: session.user.store,
    status: "ABIERTA",
  });

  if (existingOpenCash) {
    throw new Error("Ya hay una caja abierta");
  }

  const cashRegister = await CashRegister.create({
    store: session.user.store,
    openedBy: session.user.id,
    openingAmount,
    expectedAmount: openingAmount,
    status: "ABIERTA",
  });

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "OPEN_CASH_REGISTER",
    entity: "CashRegister",
    entityId: cashRegister._id.toString(),
    description: `Abrió caja con $${openingAmount}`,
  });

  await Store.findOneAndUpdate(
    {
      _id: session.user.store,
    },
    {
      "onboarding.firstCashOpened": true,
    }
  );

  revalidatePath("/caja");
  revalidatePath("/dashboard");
}

export async function addCashMovement(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = cashMovementSchema.parse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  await connectDB();

  const cashRegister = await CashRegister.findOne({
    store: session.user.store,
    status: "ABIERTA",
  });

  if (!cashRegister) {
    throw new Error("No hay caja abierta");
  }

  await CashMovement.create({
    store: session.user.store,
    cashRegister: cashRegister._id,
    user: session.user.id,
    type: parsed.type,
    source: "MANUAL",
    amount: parsed.amount,
    description: parsed.description || "",
  });

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "CREATE_CASH_MOVEMENT",
    entity: "CashMovement",
    description: `${parsed.type} manual de $${parsed.amount}`,
    metadata: {
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
    },
  });

  if (parsed.type === "INGRESO") {
    cashRegister.expectedAmount += parsed.amount;
  }

  if (parsed.type === "EGRESO") {
    cashRegister.expectedAmount -= parsed.amount;
  }

  await cashRegister.save();

  revalidatePath("/caja");
  revalidatePath("/dashboard");
}

export async function closeCashRegister(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const closingAmount = Number(formData.get("closingAmount") || 0);

  if (closingAmount < 0) {
    throw new Error("El monto contado no puede ser negativo");
  }

  await connectDB();

  const cashRegister = await CashRegister.findOne({
    store: session.user.store,
    status: "ABIERTA",
  });

  if (!cashRegister) {
    throw new Error("No hay caja abierta");
  }

  cashRegister.closingAmount = closingAmount;
  cashRegister.difference = closingAmount - cashRegister.expectedAmount;
  cashRegister.status = "CERRADA";
  cashRegister.closedAt = new Date();

  await cashRegister.save();

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "CLOSE_CASH_REGISTER",
    entity: "CashRegister",
    entityId: cashRegister._id.toString(),
    description: `Cerró caja con $${closingAmount}`,
    metadata: {
      expectedAmount: cashRegister.expectedAmount,
      closingAmount,
      difference: cashRegister.difference,
    },
  });

  revalidatePath("/caja");
  revalidatePath("/dashboard");
}

export async function reviewCashRegister(cashRegisterId: string) {
  const session = await requireRoles(["OWNER"]);

  if (!cashRegisterId) {
    throw new Error("Caja inválida");
  }

  await connectDB();

  await CashRegister.findOneAndUpdate(
    {
      _id: cashRegisterId,
      store: session.user.store,
      status: "CERRADA",
    },
    {
      status: "REVISADA",
    }
  );

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "REVIEW_CASH_REGISTER",
    entity: "CashRegister",
    entityId: cashRegisterId,
    description: "Marcó caja como revisada",
  });

  revalidatePath("/caja");
  revalidatePath("/dashboard");
}