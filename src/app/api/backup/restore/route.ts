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
import { Store } from "@/models/Store";

import { createAuditLog } from "@/lib/audit";
import { sendBackupRestoredEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
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

    const storeId = session.user.store;

    await Promise.all([
      Product.deleteMany({ store: storeId }),
      Customer.deleteMany({ store: storeId }),
      Sale.deleteMany({ store: storeId }),
      Purchase.deleteMany({ store: storeId }),
      CashRegister.deleteMany({ store: storeId }),
      CashMovement.deleteMany({ store: storeId }),
      Supplier.deleteMany({ store: storeId }),
      ProductBatch.deleteMany({ store: storeId }),
      DeliveryOrder.deleteMany({ store: storeId }),
    ]);

    async function insertSafe(Model: any, docs: any[] = []) {
      if (!Array.isArray(docs) || docs.length === 0) return;

      const cleanDocs = docs.map((doc) => ({
        ...doc,
        store: storeId,
        _id: doc._id,
      }));

      await Model.insertMany(cleanDocs, {
        ordered: false,
      });
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

    await createAuditLog({
      store: storeId,
      user: session.user.id,
      action: "RESTORE_BACKUP",
      entity: "Backup",
      description: "Restauró backup general del comercio",
    });

    const storeDoc = await Store.findById(storeId).populate(
      "owner",
      "email"
    );

    const ownerEmail = (storeDoc?.owner as any)?.email;

    if (ownerEmail) {
      await sendBackupRestoredEmail(ownerEmail);
    }

    return NextResponse.json({
      success: true,
      message: "Backup restaurado correctamente.",
    });
  } catch (error) {
    console.error("[RESTORE_BACKUP_ERROR]", error);

    return NextResponse.json(
      {
        error: "Error al restaurar backup.",
      },
      {
        status: 500,
      }
    );
  }
}