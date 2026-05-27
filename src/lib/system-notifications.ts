import { Product } from "@/models/Product";
import { ProductBatch } from "@/models/ProductBatch";
import { Customer } from "@/models/Customer";
import { CashRegister } from "@/models/CashRegister";
import { DeliveryOrder } from "@/models/DeliveryOrder";
import { Store } from "@/models/Store";
import { InternalNotification } from "@/models/InternalNotification";

export async function generateSystemNotifications(
  storeId: string
) {
  await InternalNotification.deleteMany({
    store: storeId,
  });

  const expirationLimit = new Date();
  expirationLimit.setDate(
    expirationLimit.getDate() + 30
  );

  const [
    lowStockProducts,
    expiringBatches,
    customersWithDebt,
    openCashRegister,
    pendingDeliveries,
    store,
  ] = await Promise.all([
    Product.find({
      store: storeId,
      isActive: true,
      $expr: { $lte: ["$stock", "$minStock"] },
    }).limit(10),

    ProductBatch.find({
      store: storeId,
      quantity: { $gt: 0 },
      expirationDate: {
        $lte: expirationLimit,
      },
    })
      .populate("product", "name")
      .limit(10),

    Customer.find({
      store: storeId,
      balance: { $gte: 50000 },
      isActive: true,
    }).limit(10),

    CashRegister.findOne({
      store: storeId,
      status: "ABIERTA",
    }),

    DeliveryOrder.find({
      store: storeId,
      status: {
        $in: ["PENDIENTE", "TOMADO"],
      },
    }).limit(10),

    Store.findById(storeId),
  ]);

  const notifications: any[] = [];

  for (const product of lowStockProducts) {
    notifications.push({
      store: storeId,
      type: "LOW_STOCK",
      severity: "WARNING",
      title: `Stock bajo: ${product.name}`,
      description: `Stock actual ${product.stock} · mínimo ${product.minStock}`,
      link: "/productos",
    });
  }

  for (const batch of expiringBatches) {
    notifications.push({
      store: storeId,
      type: "EXPIRING_PRODUCT",
      severity: "DANGER",
      title: `Producto próximo a vencer`,
      description: batch.product?.name || "Producto",
      link: "/vencimientos",
    });
  }

  for (const customer of customersWithDebt) {
    notifications.push({
      store: storeId,
      type: "HIGH_DEBT",
      severity: "WARNING",
      title: `Fiado alto`,
      description: `${customer.name} debe $${customer.balance}`,
      link: "/clientes",
    });
  }

  if (openCashRegister) {
    const hours =
      (Date.now() -
        new Date(
          openCashRegister.createdAt
        ).getTime()) /
      1000 /
      60 /
      60;

    if (hours >= 10) {
      notifications.push({
        store: storeId,
        type: "CASH_OPEN_TOO_LONG",
        severity: "WARNING",
        title: "Caja abierta hace muchas horas",
        description: `Caja abierta hace ${Math.floor(
          hours
        )} horas`,
        link: "/caja",
      });
    }
  }

  if (pendingDeliveries.length > 0) {
    notifications.push({
      store: storeId,
      type: "DELIVERY_PENDING",
      severity: "INFO",
      title: "Hay envíos pendientes",
      description: `${pendingDeliveries.length} pedidos pendientes`,
      link: "/envios",
    });
  }

  if (
    store?.subscription?.status === "PENDING"
  ) {
    notifications.push({
      store: storeId,
      type: "SUBSCRIPTION_PENDING",
      severity: "INFO",
      title: "Suscripción pendiente",
      description:
        "Mercado Pago todavía no confirmó el pago.",
      link: "/planes",
    });
  }

  if (notifications.length > 0) {
    await InternalNotification.insertMany(
      notifications
    );
  }
}