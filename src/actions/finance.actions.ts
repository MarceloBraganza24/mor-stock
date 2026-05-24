"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Sale } from "@/models/Sale";
import { Purchase } from "@/models/Purchase";
import { CashMovement } from "@/models/CashMovement";

export async function getFinanceReport(filters?: {
  from?: string;
  to?: string;
}) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const dateQuery: any = {};

  if (filters?.from) {
    const from = new Date(filters.from);
    from.setHours(0, 0, 0, 0);
    dateQuery.$gte = from;
  }

  if (filters?.to) {
    const to = new Date(filters.to);
    to.setHours(23, 59, 59, 999);
    dateQuery.$lte = to;
  }

  const saleQuery: any = {
    store: session.user.store,
    status: "COMPLETADA",
  };

  const purchaseQuery: any = {
    store: session.user.store,
    status: "COMPLETADA",
  };

  const cashQuery: any = {
    store: session.user.store,
  };

  if (Object.keys(dateQuery).length > 0) {
    saleQuery.createdAt = dateQuery;
    purchaseQuery.createdAt = dateQuery;
    cashQuery.createdAt = dateQuery;
  }

  const [sales, purchases, cashMovements] = await Promise.all([
    Sale.find(saleQuery),
    Purchase.find(purchaseQuery),
    CashMovement.find(cashQuery),
  ]);

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
  const totalPurchases = purchases.reduce(
    (acc, purchase) => acc + purchase.total,
    0
  );

  const manualIncomes = cashMovements
    .filter((m) => m.type === "INGRESO" && m.source === "MANUAL")
    .reduce((acc, m) => acc + m.amount, 0);

  const manualExpenses = cashMovements
    .filter((m) => m.type === "EGRESO" && m.source === "MANUAL")
    .reduce((acc, m) => acc + m.amount, 0);

  const netCashFlow = totalSales + manualIncomes - totalPurchases - manualExpenses;

  return JSON.parse(
    JSON.stringify({
      totalSales,
      totalProfit,
      totalPurchases,
      manualIncomes,
      manualExpenses,
      netCashFlow,
      salesCount: sales.length,
      purchasesCount: purchases.length,
    })
  );
}