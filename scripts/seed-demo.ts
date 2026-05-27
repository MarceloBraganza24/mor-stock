import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { User } from "../src/models/User";
import { Store } from "../src/models/Store";
import { Product } from "../src/models/Product";
import { Customer } from "../src/models/Customer";
import { Supplier } from "../src/models/Supplier";
import { Purchase } from "../src/models/Purchase";
import { Sale } from "../src/models/Sale";
import { CashRegister } from "../src/models/CashRegister";
import { CashMovement } from "../src/models/CashMovement";
import { ProductBatch } from "../src/models/ProductBatch";
import { StockMovement } from "../src/models/StockMovement";
import { DeliveryOrder } from "../src/models/DeliveryOrder";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI);

  const password = await bcrypt.hash("demo1234", 10);

  const owner = await User.create({
    name: "Dueño Demo",
    email: "demo@stocklocal.com",
    password,
    role: "OWNER",
    isActive: true,
  });

  const store = await Store.create({
    name: "Mercado Demo",
    slug: `mercado-demo-${Date.now()}`,
    owner: owner._id,
    city: "Coronel Suárez",
    address: "Av. Principal 123",
    phone: "2926 000000",
    businessType: "Mercado",
    currency: "ARS",
    plan: "PRO",
    onboarding: {
      storeCompleted: true,
      firstProductCreated: true,
      firstCashOpened: true,
      completed: true,
    },
  });

  owner.store = store._id;
  await owner.save();

  const cashier = await User.create({
    name: "Cajero Demo",
    email: "cajero@stocklocal.com",
    password,
    role: "CASHIER",
    store: store._id,
    isActive: true,
  });

  const delivery = await User.create({
    name: "Moto Demo",
    email: "moto@stocklocal.com",
    password,
    role: "DELIVERY",
    store: store._id,
    isActive: true,
  });

  const products = await Product.insertMany([
    {
      store: store._id,
      name: "Leche entera 1L",
      barcode: "7790001000011",
      category: "Lácteos",
      costPrice: 900,
      salePrice: 1300,
      stock: 20,
      minStock: 5,
    },
    {
      store: store._id,
      name: "Yerba mate 1kg",
      barcode: "7790001000028",
      category: "Almacén",
      costPrice: 2500,
      salePrice: 3400,
      stock: 12,
      minStock: 4,
    },
    {
      store: store._id,
      name: "Gaseosa cola 2.25L",
      barcode: "7790001000035",
      category: "Bebidas",
      costPrice: 1800,
      salePrice: 2600,
      stock: 8,
      minStock: 3,
    },
  ]);

  const customers = await Customer.insertMany([
    {
      store: store._id,
      name: "Juan Pérez",
      phone: "2926 111111",
      balance: 4500,
    },
    {
      store: store._id,
      name: "María Gómez",
      phone: "2926 222222",
      balance: 0,
    },
  ]);

  const supplier = await Supplier.create({
    store: store._id,
    name: "Distribuidora Centro",
    phone: "2926 333333",
  });

  const cash = await CashRegister.create({
    store: store._id,
    openedBy: owner._id,
    openingAmount: 20000,
    expectedAmount: 20000,
    status: "ABIERTA",
  });

  const purchase = await Purchase.create({
    store: store._id,
    supplier: supplier._id,
    user: owner._id,
    paymentMethod: "TRANSFERENCIA",
    total: 39000,
    items: products.map((product: any) => ({
      product: product._id,
      name: product.name,
      quantity: 10,
      unitCost: product.costPrice,
      subtotal: product.costPrice * 10,
    })),
  });

  for (const product of products as any[]) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 20);

    await ProductBatch.create({
      store: store._id,
      product: product._id,
      batchCode: `L-${product._id.toString().slice(-4)}`,
      quantity: 5,
      expirationDate,
    });

    await StockMovement.create({
      store: store._id,
      product: product._id,
      user: owner._id,
      type: "SUMA",
      quantity: 10,
      previousStock: product.stock - 10,
      newStock: product.stock,
      reason: "Seed demo",
    });
  }

  const sale = await Sale.create({
    store: store._id,
    user: cashier._id,
    customer: null,
    paymentMethod: "EFECTIVO",
    total: 4700,
    profit: 1500,
    items: [
      {
        product: products[0]._id,
        name: products[0].name,
        quantity: 1,
        unitPrice: products[0].salePrice,
        costPrice: products[0].costPrice,
        subtotal: products[0].salePrice,
        batches: [],
      },
      {
        product: products[1]._id,
        name: products[1].name,
        quantity: 1,
        unitPrice: products[1].salePrice,
        costPrice: products[1].costPrice,
        subtotal: products[1].salePrice,
        batches: [],
      },
    ],
  });

  await CashMovement.create({
    store: store._id,
    cashRegister: cash._id,
    user: cashier._id,
    sale: sale._id,
    type: "INGRESO",
    source: "VENTA_EFECTIVO",
    amount: sale.total,
    description: `Venta demo #${sale._id.toString().slice(-6)}`,
  });

  cash.expectedAmount += sale.total;
  await cash.save();

  await DeliveryOrder.create({
    store: store._id,
    requestedBy: cashier._id,
    deliveryUser: delivery._id,
    customerName: "Cliente domicilio",
    customerPhone: "2926 444444",
    address: "Belgrano 456",
    notes: "Tocar timbre",
    deliveryFee: 1200,
    status: "TOMADO",
  });

  console.log("Seed demo creado correctamente.");
  console.log("Login dueño: demo@stocklocal.com / demo1234");
  console.log("Login cajero: cajero@stocklocal.com / demo1234");
  console.log("Login moto: moto@stocklocal.com / demo1234");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});