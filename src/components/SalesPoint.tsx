"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sale.actions";
import { createCustomer } from "@/actions/customer.actions";

type Product = {
  _id: string;
  name: string;
  barcode?: string;
  salePrice: number;
  stock: number;
};

type Customer = {
  _id: string;
  name: string;
  balance: number;
};

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};

type PaymentMethod =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEBITO"
  | "CREDITO"
  | "QR"
  | "FIADO";

export function SalesPoint({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("EFECTIVO");
  const [customerId, setCustomerId] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const value = query.toLowerCase().trim();

    if (!value) return products.slice(0, 10);

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(value) ||
          product.barcode?.includes(value)
        );
      })
      .slice(0, 12);
  }, [products, query]);

  const total = cart.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  function addToCart(product: Product) {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product._id);

      if (exists) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
          unitPrice: product.salePrice,
          stock: product.stock,
        },
      ];
    });

    setQuery("");
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function finishSale() {
    setMessage("");

    startTransition(async () => {
      const result = await createSale({
        paymentMethod,
        customerId: paymentMethod === "FIADO" ? customerId : undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (result?.error) {
        setMessage(result.error);
        return;
      }

      setCart([]);
      setCustomerId("");
      setMessage("Venta registrada correctamente.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold sm:text-xl">Buscar producto</h2>
          <p className="text-sm text-white/40">
            Tocá un producto para sumarlo a la venta.
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o código"
          className="mt-4 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-4 text-base outline-none focus:border-emerald-500"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    Stock: {product.stock}
                    {product.barcode ? ` · ${product.barcode}` : ""}
                  </p>
                </div>

                <p className="shrink-0 text-lg font-bold text-emerald-400">
                  ${product.salePrice}
                </p>
              </div>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40 sm:col-span-2 xl:col-span-1 2xl:col-span-2">
              No se encontraron productos.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 xl:sticky xl:top-24 xl:self-start">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Venta actual</h2>
            <p className="text-sm text-white/40">{cart.length} productos</p>
          </div>

          <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-lg font-bold text-emerald-400">
            ${total}
          </p>
        </div>

        <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="rounded-xl border border-white/10 bg-neutral-900 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-sm text-white/50">${item.unitPrice} c/u</p>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="shrink-0 text-sm text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="bg-neutral-950 px-3 py-2 text-lg"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 bg-neutral-950 px-2 py-2 text-center outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="bg-neutral-950 px-3 py-2 text-lg"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold">${item.quantity * item.unitPrice}</p>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
              Todavía no agregaste productos.
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm text-white/50">Método de pago</label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-4 text-base outline-none focus:border-emerald-500"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="QR">QR</option>
            <option value="FIADO">Fiado</option>
          </select>
        </div>

        {paymentMethod === "FIADO" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-white/50">Cliente</label>

              <button
                type="button"
                onClick={() => setShowNewCustomer((prev) => !prev)}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                + Crear cliente
              </button>
            </div>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-4 text-base outline-none focus:border-emerald-500"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - debe ${customer.balance}
                </option>
              ))}
            </select>

            {showNewCustomer && (
              <form
                action={async (formData) => {
                  await createCustomer(formData);
                  setShowNewCustomer(false);
                  setMessage("Cliente creado. Ya podés seleccionarlo.");
                  router.refresh();
                }}
                className="mt-4 grid gap-3"
              >
                <input
                  name="name"
                  placeholder="Nombre del cliente"
                  required
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="phone"
                  placeholder="Teléfono"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="notes"
                  placeholder="Notas"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <button className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400">
                  Guardar cliente
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-white/60">Total</p>
            <p className="text-3xl font-bold">${total}</p>
          </div>

          <button
            onClick={finishSale}
            disabled={cart.length === 0 || isPending}
            className="mt-5 w-full rounded-xl bg-emerald-500 py-4 text-base font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Registrando..." : "Finalizar venta"}
          </button>

          {message && (
            <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-emerald-400">
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}