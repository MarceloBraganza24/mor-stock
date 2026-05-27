"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase.actions";
import { FormMessage } from "@/components/ui/FormMessage";

type Product = {
  _id: string;
  name: string;
  barcode?: string;
  costPrice: number;
  stock: number;
};

type Supplier = {
  _id: string;
  name: string;
};

type PurchaseItem = {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
};

type PaymentMethod =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEBITO"
  | "CREDITO"
  | "QR"
  | "CUENTA_CORRIENTE";

export function PurchaseForm({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("EFECTIVO");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const value = query.toLowerCase().trim();

    if (!value) return products.slice(0, 8);

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(value) ||
          product.barcode?.includes(value)
        );
      })
      .slice(0, 10);
  }, [products, query]);

  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );

  function addProduct(product: Product) {
    setItems((prev) => {
      const exists = prev.find((item) => item.productId === product._id);

      if (exists) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
          unitCost: product.costPrice || 0,
        },
      ];
    });

    setQuery("");
  }

  function updateItem(
    productId: string,
    field: "quantity" | "unitCost",
    value: number
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              [field]: Math.max(0, value),
            }
          : item
      )
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function submitPurchase() {

    startTransition(async () => {
      const result = await createPurchase({
        supplierId: supplierId || undefined,
        paymentMethod,
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      });

      if (!result.success) {
        setErrorMessage(result.error);
        setSuccessMessage("");
        return;
      }

      setErrorMessage("");
      setSuccessMessage(result.message || "Compra registrada correctamente.");

      setItems([]);
      setSupplierId("");
      setNotes("");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-semibold">Buscar productos</h2>
        <p className="mt-1 text-sm text-white/50">
          Seleccioná los productos comprados para sumar stock.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto o código"
          className="mt-4 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-4 outline-none focus:border-emerald-500"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => addProduct(product)}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-left hover:bg-white/10"
            >
              <p className="font-medium">{product.name}</p>
              <p className="mt-1 text-sm text-white/40">
                Stock: {product.stock} · Costo actual: ${product.costPrice}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:sticky xl:top-24 xl:self-start">
        <h2 className="text-xl font-semibold">Compra actual</h2>

        <div className="mt-4">
          <label className="text-sm text-white/50">Proveedor</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm text-white/50">Forma de pago</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="QR">QR</option>
            <option value="CUENTA_CORRIENTE">Cuenta corriente</option>
          </select>
        </div>

        <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.productId}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4"
            >
              <div className="flex justify-between gap-3">
                <p className="font-medium">{item.name}</p>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-400"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.productId, "quantity", Number(e.target.value))
                  }
                  placeholder="Cantidad"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 outline-none focus:border-emerald-500"
                />

                <input
                  type="number"
                  value={item.unitCost}
                  onChange={(e) =>
                    updateItem(item.productId, "unitCost", Number(e.target.value))
                  }
                  placeholder="Costo unitario"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <p className="mt-3 text-right font-semibold">
                Subtotal: ${item.quantity * item.unitCost}
              </p>
            </div>
          ))}

          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
              Todavía no agregaste productos.
            </p>
          )}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas de la compra"
          className="mt-4 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex justify-between">
            <span className="text-white/60">Total compra</span>
            <span className="text-3xl font-bold">${total}</span>
          </div>

          <button
            onClick={submitPurchase}
            disabled={items.length === 0 || isPending}
            className="mt-5 w-full rounded-xl bg-emerald-500 py-4 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPending ? "Registrando..." : "Registrar compra"}
          </button>

          <div className="mt-3 space-y-3">
            <FormMessage message={successMessage} type="success" />
            <FormMessage message={errorMessage} type="error" />
          </div>
        </div>
      </section>
    </div>
  );
}