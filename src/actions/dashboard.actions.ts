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

  const store = session.user.store!;

  await generateSystemNotifications(store);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const expirationLimit = new Date();
  expirationLimit.setDate(expirationLimit.getDate() + 30);
  expirationLimit.setHours(23, 59, 59, 999);

  const [
    salesTodayStats,
    purchasesTodayStats,
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
    Sale.aggregate([
      {
        $match: {
          store,
          status: "COMPLETADA",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$total" },
          profit: { $sum: "$profit" },
          count: { $sum: 1 },
        },
      },
    ]),

    Purchase.aggregate([
      {
        $match: {
          store,
          status: "COMPLETADA",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalPurchasesToday: { $sum: "$total" },
        },
      },
    ]),

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

  const totalSalesToday = salesTodayStats.reduce(
    (acc: number, item: any) => acc + Number(item.total || 0),
    0
  );

  const totalProfitToday = salesTodayStats.reduce(
    (acc: number, item: any) => acc + Number(item.profit || 0),
    0
  );

  const salesCountToday = salesTodayStats.reduce(
    (acc: number, item: any) => acc + Number(item.count || 0),
    0
  );

  const salesByPaymentMethod = salesTodayStats.reduce<Record<string, number>>(
    (acc, item: any) => {
      if (item._id) {
        acc[item._id] = Number(item.total || 0);
      }

      return acc;
    },
    {}
  );

  const totalPurchasesToday =
    purchasesTodayStats[0]?.totalPurchasesToday || 0;

  const totalDebt = customersWithDebt.reduce(
    (acc: number, customer: any) => acc + Number(customer.balance || 0),
    0
  );

  const netToday = totalSalesToday - totalPurchasesToday;

  return JSON.parse(
    JSON.stringify({
      totalSalesToday,
      totalProfitToday,
      totalPurchasesToday,
      netToday,
      salesCountToday,
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