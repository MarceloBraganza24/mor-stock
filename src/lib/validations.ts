import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  barcode: z.string().optional(),
  category: z.string().optional(),
  costPrice: z.coerce.number().min(0, "El costo no puede ser negativo"),
  salePrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
});

export const customerSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["CASHIER", "STOCKER", "DELIVERY"]),
});

export const deliveryOrderSchema = z.object({
  customerName: z.string().min(2, "El nombre del cliente es obligatorio"),
  customerPhone: z.string().min(5, "El teléfono es obligatorio"),
  address: z.string().min(3, "La dirección es obligatoria"),
  notes: z.string().optional(),
  deliveryFee: z.coerce.number().min(0).default(0),
});

export const cashMovementSchema = z.object({
  type: z.enum(["INGRESO", "EGRESO"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().optional(),
});

export const customerPaymentSchema = z.object({
  customerId: z.string().min(1),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().optional(),
  paymentMethod: z.enum(["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR"]),
});

export const customerDebtSchema = z.object({
  customerId: z.string().min(1),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["SUMA", "RESTA", "AJUSTE"]),
  quantity: z.coerce.number().int().min(0),
  reason: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "El proveedor es obligatorio"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const purchaseSchema = z.object({
  supplierId: z.string().optional(),
  paymentMethod: z.enum([
    "EFECTIVO",
    "TRANSFERENCIA",
    "DEBITO",
    "CREDITO",
    "QR",
    "CUENTA_CORRIENTE",
  ]),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        unitCost: z.coerce.number().min(0),
      })
    )
    .min(1),
});