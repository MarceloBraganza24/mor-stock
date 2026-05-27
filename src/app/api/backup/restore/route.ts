import { NextRequest, NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Sale } from "@/models/Sale";
import { Purchase } from "@/models/Purchase";
import { CashRegister } from "@/models/CashRegister";
import { CashMovement } from "@/models/CashMovement";
import { Supplier } from "@/models/Supplier";
import { ProductBatch } from "@/models/ProductBatch";
import { DeliveryOrder } from "@/models/DeliveryOrder";
import { createAuditLog } from "@/lib/audit";
import { Store } from "@/models/Store";
import {
  sendStoreReactivatedEmail,
  sendStoreSuspendedEmail,
} from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo." },
      { status: 400 }
    );
  }

  const text = await file.text();
  const backup = JSON.parse(text);

  const store = session.user.store;

  await Promise.all([
    Product.deleteMany({ store }),
    Customer.deleteMany({ store }),
    Sale.deleteMany({ store }),
    Purchase.deleteMany({ store }),
    CashRegister.deleteMany({ store }),
    CashMovement.deleteMany({ store }),
    Supplier.deleteMany({ store }),
    ProductBatch.deleteMany({ store }),
    DeliveryOrder.deleteMany({ store }),
  ]);

  async function insertSafe(Model: any, docs: any[] = []) {
    if (!Array.isArray(docs) || docs.length === 0) return;

    const cleanDocs = docs.map((doc) => ({
      ...doc,
      store,
      _id: doc._id,
    }));

    await Model.insertMany(cleanDocs, { ordered: false });
  }

  await insertSafe(Product, backup.products);
  await insertSafe(Customer, backup.customers);
  await insertSafe(Supplier, backup.suppliers);
  await insertSafe(ProductBatch, backup.batches);
  await insertSafe(Sale, backup.sales);
  await insertSafe(Purchase, backup.purchases);
  await insertSafe(CashRegister, backup.cashRegisters);
  await insertSafe(CashMovement, backup.cashMovements);
  await insertSafe(DeliveryOrder, backup.deliveryOrders);

  const store = await Store.findById(storeId).populate("owner", "email name");

  if (store?.owner?.email) {
    if (isActive) {
      await sendStoreReactivatedEmail(store.owner.email, store.name);
    } else {
      await sendStoreSuspendedEmail(store.owner.email, store.name);
    }
  }

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "RESTORE_BACKUP",
    entity: "Backup",
    description: "Restauró backup general del comercio",
  });

  return NextResponse.json({
    success: true,
    message: "Backup restaurado correctamente.",
  });
}