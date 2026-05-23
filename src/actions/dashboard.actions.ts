"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { Customer } from "@/models/Customer";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";

export async function getDashboardMetrics() {
  const session = await auth();

  if (!session?.user?.store) {
    throw new Error("No autorizado");
  }

  await connectDB();

  const store = session.user.store;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [
    todaySales,
    productsCount,
    lowStockProducts,
    customersWithDebt,
    openCashRegister,
    recentSales,
  ] = await Promise.all([
    Sale.find({
      store,
      status: "COMPLETADA",
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }),

    Product.countDocuments({
      store,
      isActive: true,
    }),

    Product.find({
      store,
      isActive: true,
      $expr: { $lte: ["$stock", "$minStock"] },
    })
      .sort({ stock: 1 })
      .limit(6),

    Customer.find({
      store,
      isActive: true,
      balance: { $gt: 0 },
    }).sort({ balance: -1 }),

    CashRegister.findOne({
      store,
      status: "ABIERTA",
    }).sort({ createdAt: -1 }),

    Sale.find({
      store,
      status: "COMPLETADA",
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  let recentCashMovements: any[] = [];

  if (openCashRegister) {
    recentCashMovements = await CashMovement.find({
      store,
      cashRegister: openCashRegister._id,
    })
      .sort({ createdAt: -1 })
      .limit(6);
  }

  const totalSalesToday = todaySales.reduce(
    (acc, sale) => acc + sale.total,
    0
  );

  const totalProfitToday = todaySales.reduce(
    (acc, sale) => acc + sale.profit,
    0
  );

  const totalDebt = customersWithDebt.reduce(
    (acc, customer) => acc + customer.balance,
    0
  );

  const salesByPaymentMethod = todaySales.reduce<Record<string, number>>(
    (acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
      return acc;
    },
    {}
  );

  return JSON.parse(
    JSON.stringify({
      totalSalesToday,
      totalProfitToday,
      salesCountToday: todaySales.length,
      productsCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      customersWithDebtCount: customersWithDebt.length,
      totalDebt,
      salesByPaymentMethod,
      openCashRegister,
      recentSales,
      recentCashMovements,
    })
  );
}