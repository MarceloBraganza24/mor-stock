"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Sale } from "@/models/Sale";
import { CreditMovement } from "@/models/CreditMovement";
import { Customer } from "@/models/Customer";

export async function getPaymentsReport(filters?: {
  from?: string;
  to?: string;
}) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const dateQuery: any = {};

  if (filters?.from) {
    const fromDate = new Date(filters.from);
    fromDate.setHours(0, 0, 0, 0);
    dateQuery.$gte = fromDate;
  }

  if (filters?.to) {
    const toDate = new Date(filters.to);
    toDate.setHours(23, 59, 59, 999);
    dateQuery.$lte = toDate;
  }

  const saleQuery: any = {
    store: session.user.store!,
    status: "COMPLETADA",
  };

  const creditQuery: any = {
    store: session.user.store!,
    type: "PAGO",
  };

  if (Object.keys(dateQuery).length > 0) {
    saleQuery.createdAt = dateQuery;
    creditQuery.createdAt = dateQuery;
  }

  const [sales, creditPayments, customersWithDebt] = await Promise.all([
    Sale.find(saleQuery)
      .populate("customer", "name")
      .populate("user", "name role")
      .sort({ createdAt: -1 }),

    CreditMovement.find(creditQuery)
      .populate("customer", "name")
      .populate("user", "name role")
      .sort({ createdAt: -1 }),

    Customer.find({
      store: session.user.store!,
      isActive: true,
      balance: { $gt: 0 },
    }).sort({ balance: -1 }),
  ]);

  const methods = ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR"];

  const salesByMethod: Record<string, number> = {};
  const creditPaymentsByMethod: Record<string, number> = {};

  for (const method of methods) {
    salesByMethod[method] = 0;
    creditPaymentsByMethod[method] = 0;
  }

  let fiadoSales = 0;

  for (const sale of sales) {
    if (sale.paymentMethod === "FIADO") {
      fiadoSales += sale.total;
    } else {
      salesByMethod[sale.paymentMethod] =
        (salesByMethod[sale.paymentMethod] || 0) + sale.total;
    }
  }

  for (const payment of creditPayments) {
    creditPaymentsByMethod[payment.paymentMethod] =
      (creditPaymentsByMethod[payment.paymentMethod] || 0) + payment.amount;
  }

  const totalDirectSales = Object.values(salesByMethod).reduce(
    (acc, value) => acc + value,
    0
  );

  const totalCreditPayments = Object.values(creditPaymentsByMethod).reduce(
    (acc, value) => acc + value,
    0
  );

  const totalCollected = totalDirectSales + totalCreditPayments;

  const totalPendingDebt = customersWithDebt.reduce(
    (acc, customer) => acc + customer.balance,
    0
  );

  const movements = [
    ...sales
      .filter((sale) => sale.paymentMethod !== "FIADO")
      .map((sale: any) => ({
        id: sale._id.toString(),
        date: sale.createdAt,
        type: "VENTA",
        method: sale.paymentMethod,
        amount: sale.total,
        customer: sale.customer?.name || "-",
        user: sale.user?.name || "-",
        description: `Venta #${sale._id.toString().slice(-6)}`,
      })),

    ...creditPayments.map((payment: any) => ({
      id: payment._id.toString(),
      date: payment.createdAt,
      type: "PAGO_FIADO",
      method: payment.paymentMethod,
      amount: payment.amount,
      customer: payment.customer?.name || "-",
      user: payment.user?.name || "-",
      description: payment.description || "Pago de fiado",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return JSON.parse(
    JSON.stringify({
      salesByMethod,
      creditPaymentsByMethod,
      totalDirectSales,
      totalCreditPayments,
      totalCollected,
      fiadoSales,
      totalPendingDebt,
      customersWithDebt,
      movements,
    })
  );
}