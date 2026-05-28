"use client";

import { useState, useTransition } from "react";
import { createManualSale } from "@/actions/sale.actions";

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export function ManualSaleForm() {
  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function updateItem(
    index: number,
    field: keyof Item,
    value: string
  ) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "name"
                  ? value
                  : Number(value),
            }
          : item
      )
    );
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    setError("");
    setMessage("");

    startTransition(async () => {
      const validItems = items.filter(
        (item) =>
          item.name.trim() &&
          item.quantity > 0 &&
          item.unitPrice > 0
      );

      const result = await createManualSale(validItems);

      if (!result.success) {
        setError(result.error || "No se pudo registrar.");
        return;
      }

      setMessage("Venta manual registrada correctamente.");

      setItems([
        {
          name: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]);
    });
  }

  const total = items.reduce(
    (acc, item) =>
      acc + item.quantity * item.unitPrice,
    0
  );

  return (
    <section className="app-card-2xl p-5">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-400">
          POS
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Venta manual
        </h2>

        <p className="mt-2 app-muted">
          Registrá ventas rápidas sin afectar stock.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 md:grid-cols-4"
          >
            <input
              value={item.name}
              onChange={(e) =>
                updateItem(index, "name", e.target.value)
              }
              placeholder="Concepto"
              className="app-input"
            />

            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", e.target.value)
              }
              placeholder="Cantidad"
              className="app-input"
            />

            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) =>
                updateItem(index, "unitPrice", e.target.value)
              }
              placeholder="Precio"
              className="app-input"
            />

            <button
              onClick={() => removeRow(index)}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={addRow}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
        >
          Agregar fila
        </button>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950"
        >
          {isPending
            ? "Registrando..."
            : "Registrar venta"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm app-muted">
          Total
        </p>

        <h3 className="mt-2 text-4xl font-black text-emerald-400">
          $
          {total.toLocaleString("es-AR")}
        </h3>
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
    </section>
  );
}