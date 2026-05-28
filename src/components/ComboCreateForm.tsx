"use client";

import { useState, useTransition } from "react";
import { createCombo } from "@/actions/combo.actions";

export function ComboCreateForm({
  products,
}: {
  products: any[];
}) {
  const [rows, setRows] = useState([
    {
      product: "",
      quantity: 1,
    },
  ]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        product: "",
        quantity: 1,
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function updateRow(
    index: number,
    field: string,
    value: string
  ) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === "quantity"
                  ? Number(value)
                  : value,
            }
          : row
      )
    );
  }

  function handleSubmit(formData: FormData) {
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await createCombo(formData);

      if (!result.success) {
        setError(result.error || "Error.");
        return;
      }

      setMessage(result.message || "Combo creado.");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="app-card-2xl mb-8 p-5"
    >
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-400">
          Combos
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Nuevo combo
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="name"
          placeholder="Nombre del combo"
          className="app-input"
          required
        />

        <input
          name="comboPrice"
          type="number"
          placeholder="Precio final"
          className="app-input"
          required
        />
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 md:grid-cols-3"
          >
            <select
              name="product"
              value={row.product}
              onChange={(e) =>
                updateRow(
                  index,
                  "product",
                  e.target.value
                )
              }
              className="app-input"
            >
              <option value="">
                Seleccionar producto
              </option>

              {products.map((product) => (
                <option
                  key={product._id}
                  value={product._id}
                >
                  {product.name} - $
                  {product.salePrice}
                </option>
              ))}
            </select>

            <input
              name="quantity"
              type="number"
              value={row.quantity}
              onChange={(e) =>
                updateRow(
                  index,
                  "quantity",
                  e.target.value
                )
              }
              className="app-input"
            />

            <button
              type="button"
              onClick={() => removeRow(index)}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
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
          {isPending
            ? "Guardando..."
            : "Crear combo"}
        </button>
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