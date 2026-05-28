"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Sale } from "@/models/Sale";
import { assertFeatureEnabled } from "@/lib/plan-utils";

export async function getSalesReport(filters?: {
  from?: string;
  to?: string;
}) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  await assertFeatureEnabled(session.user.store, "reports");
  
  const query: any = {
    store: session.user.store!,
    status: "COMPLETADA",
  };

  if (filters?.from || filters?.to) {
    query.createdAt = {};

    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = fromDate;
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  const sales = await Sale.find(query).sort({ createdAt: -1 });

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);

  const salesByPaymentMethod = sales.reduce<Record<string, number>>(
    (acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
      return acc;
    },
    {}
  );

  const productMap = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
      profit: number;
    }
  >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.product.toString();

      const current = productMap.get(key) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
        profit: 0,
      };

      current.quantity += item.quantity;
      current.revenue += item.subtotal;
      current.profit += (item.unitPrice - item.costPrice) * item.quantity;

      productMap.set(key, current);
    }
  }

  const topProducts = Array.from(productMap.values()).sort(
    (a, b) => b.quantity - a.quantity
  );

  return JSON.parse(
    JSON.stringify({
      totalSales: sales.length,
      totalRevenue,
      totalProfit,
      salesByPaymentMethod,
      topProducts: topProducts.slice(0, 20),
    })
  );
}