"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { Customer } from "@/models/Customer";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { ProductBatch } from "@/models/ProductBatch";
import { Purchase } from "@/models/Purchase";
import { DeliveryOrder } from "@/models/DeliveryOrder";
import { generateSystemNotifications } from "@/lib/system-notifications";
import { InternalNotification } from "@/models/InternalNotification";

export async function getDashboardMetrics() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = session.user.store;

  await generateSystemNotifications(store);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const expirationLimit = new Date();
  expirationLimit.setDate(expirationLimit.getDate() + 30);
  expirationLimit.setHours(23, 59, 59, 999);

  const [
    todaySales,
    todayPurchases,
    productsCount,
    lowStockProducts,
    expiringBatches,
    customersWithDebt,
    openCashRegister,
    recentSales,
    recentCashMovements,
    pendingDeliveries,
    notifications,
  ] = await Promise.all([
    Sale.find({
      store,
      status: "COMPLETADA",
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }),
      
    Purchase.find({
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

    ProductBatch.find({
      store,
      isActive: true,
      quantity: { $gt: 0 },
      expirationDate: { $lte: expirationLimit },
    })
      .populate("product", "name barcode category")
      .sort({ expirationDate: 1 })
      .limit(6),

    Customer.find({
      store,
      isActive: true,
      balance: { $gt: 0 },
    })
      .sort({ balance: -1 })
      .limit(6),

    CashRegister.findOne({
      store,
      status: "ABIERTA",
    }).sort({ createdAt: -1 }),

    Sale.find({
      store,
      status: "COMPLETADA",
    })
      .populate("customer", "name")
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(6),

    CashMovement.find({
      store,
    })
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(6),

    DeliveryOrder.find({
      store,
      status: { $in: ["PENDIENTE", "TOMADO", "EN_CAMINO"] },
    })
      .populate("deliveryUser", "name")
      .sort({ createdAt: -1 })
      .limit(6),
    
    InternalNotification.find({
      store,
    })
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  const totalSalesToday = todaySales.reduce(
    (acc, sale) => acc + sale.total,
    0
  );

  const totalProfitToday = todaySales.reduce(
    (acc, sale) => acc + sale.profit,
    0
  );

  const totalPurchasesToday = todayPurchases.reduce(
    (acc, purchase) => acc + purchase.total,
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

  const netToday = totalSalesToday - totalPurchasesToday;

  return JSON.parse(
    JSON.stringify({
      totalSalesToday,
      totalProfitToday,
      totalPurchasesToday,
      netToday,
      salesCountToday: todaySales.length,
      productsCount,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      expiringBatches,
      expiringCount: expiringBatches.length,
      customersWithDebt,
      totalDebt,
      openCashRegister,
      salesByPaymentMethod,
      recentSales,
      recentCashMovements,
      pendingDeliveries,
      notifications,
    })
  );
}