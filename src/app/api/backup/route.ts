import { NextResponse } from "next/server";
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
import { sendBackupDownloadedEmail } from "@/lib/email-templates";

export async function GET() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = session.user.store;

  const backup = {
    generatedAt: new Date(),
    products: await Product.find({ store }),
    customers: await Customer.find({ store }),
    sales: await Sale.find({ store }),
    purchases: await Purchase.find({ store }),
    cashRegisters: await CashRegister.find({ store }),
    cashMovements: await CashMovement.find({ store }),
    suppliers: await Supplier.find({ store }),
    batches: await ProductBatch.find({ store }),
    deliveryOrders: await DeliveryOrder.find({ store }),
  };

  const storee = await Store.findById(session.user.store).populate("owner", "email");

  if (storee?.owner?.email) {
    await sendBackupDownloadedEmail(storee.owner.email);
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup-stock-local.json"`,
    },
  });
}