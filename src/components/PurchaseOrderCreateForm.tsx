"use client";

import { useState, useTransition } from "react";
import { createPurchaseOrder } from "@/actions/purchase-order.actions";

export function PurchaseOrderCreateForm({
  suppliers,
  products,
}: {
  suppliers: any[];
  products: any[];
}) {
  const [rows, setRows] = useState([
    {
      productId: "",
      quantity: 1,
      estimatedCost: 0,
    },
  ]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        productId: "",
        quantity: 1,
        estimatedCost: 0,
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: string, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === "productId"
                  ? value
                  : Number(value),
            }
          : row
      )
    );
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((item) => item._id === productId);

    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              productId,
              estimatedCost: Number(product?.costPrice || 0),
            }
          : row
      )
    );
  }

  function handleSubmit(formData: FormData) {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await createPurchaseOrder(formData);

      if (!result.success) {
        setError(result.error || "No se pudo crear la orden.");
        return;
      }

      setMessage(result.message || "Orden creada correctamente.");

      setRows([
        {
          productId: "",
          quantity: 1,
          estimatedCost: 0,
        },
      ]);
    });
  }

  const total = rows.reduce(
    (acc, row) =>
      acc +
      Number(row.quantity || 0) *
        Number(row.estimatedCost || 0),
    0
  );

  return (
    <form action={handleSubmit} className="app-card-2xl mb-8 p-5">
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-400">
          Proveedores
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Nueva orden de compra
        </h2>

        <p className="mt-2 app-muted">
          Armá un pedido para enviar a un proveedor.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select name="supplierId" required className="app-input">
          <option value="">Seleccionar proveedor</option>

          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <input
          name="notes"
          placeholder="Observaciones"
          className="app-input"
        />
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 xl:grid-cols-[1fr_140px_160px_120px]"
          >
            <select
              name="productId"
              value={row.productId}
              onChange={(e) =>
                handleProductChange(index, e.target.value)
              }
              className="app-input"
            >
              <option value="">Seleccionar producto</option>

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} — stock {product.stock}
                </option>
              ))}
            </select>

            <input
              name="quantity"
              type="number"
              min="1"
              value={row.quantity}
              onChange={(e) =>
                updateRow(index, "quantity", e.target.value)
              }
              className="app-input"
            />

            <input
              name="estimatedCost"
              type="number"
              min="0"
              value={row.estimatedCost}
              onChange={(e) =>
                updateRow(index, "estimatedCost", e.target.value)
              }
              className="app-input"
            />

            <button
              type="button"
              onClick={() => removeRow(index)}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
          >
            Agregar producto
          </button>

          <button
            disabled={isPending}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950"
          >
            {isPending ? "Guardando..." : "Crear orden"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
          <p className="text-sm app-muted">Total estimado</p>
          <p className="text-2xl font-black text-emerald-400">
            ${total.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </form>
  );
}