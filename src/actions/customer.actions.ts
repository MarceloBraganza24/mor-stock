"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { CreditMovement } from "@/models/CreditMovement";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { requireRoles } from "@/lib/auth-utils";
import {
  customerDebtSchema,
  customerPaymentSchema,
  customerSchema,
} from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function getCustomers() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const customers = await Customer.find({
    store: session.user.store!,
    isActive: true,
  }).sort({ balance: -1 });

  return JSON.parse(JSON.stringify(customers));
}

export async function getCustomerMovements(customerId: string) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const movements = await CreditMovement.find({
    store: session.user.store!,
    customer: customerId,
  })
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(movements));
}

export async function getCreditMovements() {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  await connectDB();

  const movements = await CreditMovement.find({
    store: session.user.store!,
  })
    .populate("customer", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(100);

  return JSON.parse(JSON.stringify(movements));
}

export async function createCustomer(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = customerSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });

  await connectDB();

  await Customer.create({
    store: session.user.store!,
    ...parsed,
  });

  revalidatePath("/clientes");
  revalidatePath("/ventas");
}

export async function addDebt(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = customerDebtSchema.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  await connectDB();

  const customer = await Customer.findOne({
    _id: parsed.customerId,
    store: session.user.store!,
    isActive: true,
  });

  if (!customer) {
    throw new Error("Cliente no encontrado");
  }

  customer.balance += parsed.amount;
  await customer.save();

  await CreditMovement.create({
    store: session.user.store!,
    customer: customer._id,
    user: session.user.id,
    type: "DEUDA",
    paymentMethod: "NINGUNO",
    amount: parsed.amount,
    description: parsed.description || "Deuda manual",
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "ADD_CUSTOMER_DEBT",
    entity: "Customer",
    entityId: customer._id.toString(),
    description: `Sumó deuda a ${customer.name}`,
    metadata: {
      amount: parsed.amount,
    },
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function registerPayment(formData: FormData) {
  const session = await requireRoles(["OWNER", "CASHIER"]);

  const parsed = customerPaymentSchema.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    paymentMethod: formData.get("paymentMethod"),
  });

  await connectDB();

  const customer = await Customer.findOne({
    _id: parsed.customerId,
    store: session.user.store!,
    isActive: true,
  });

  if (!customer) {
    throw new Error("Cliente no encontrado");
  }

  const realPaymentAmount = Math.min(parsed.amount, customer.balance);

  customer.balance = Math.max(0, customer.balance - realPaymentAmount);
  await customer.save();

  const creditMovement = await CreditMovement.create({
    store: session.user.store!,
    customer: customer._id,
    user: session.user.id,
    type: "PAGO",
    paymentMethod: parsed.paymentMethod,
    amount: realPaymentAmount,
    description: parsed.description || "Pago recibido",
  });

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "REGISTER_CUSTOMER_PAYMENT",
    entity: "CreditMovement",
    entityId: creditMovement._id.toString(),
    description: `Registró pago de fiado de ${customer.name}`,
    metadata: {
      amount: realPaymentAmount,
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
        type: "INGRESO",
        source: "PAGO_FIADO",
        amount: realPaymentAmount,
        description: `Pago fiado ${customer.name} #${creditMovement._id
          .toString()
          .slice(-6)}`,
      });

      openCashRegister.expectedAmount += realPaymentAmount;
      await openCashRegister.save();
    }
  }

  revalidatePath("/clientes");
  revalidatePath("/caja");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(customerId: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  await Customer.findOneAndUpdate(
    {
      _id: customerId,
      store: session.user.store!,
    },
    {
      isActive: false,
    }
  );

  revalidatePath("/clientes");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
}