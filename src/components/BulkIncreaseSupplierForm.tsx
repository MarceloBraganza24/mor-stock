"use client";

import { useState, useTransition } from "react";

import { bulkIncreaseBySupplier } from "@/actions/product.actions";

export function BulkIncreaseSupplierForm({
  suppliers,
}: {
  suppliers: any[];
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result =
        await bulkIncreaseBySupplier(formData);

      if (!result.success) {
        setError(result.error || "Error.");
        return;
      }

      setMessage(
        result.message || "Productos actualizados."
      );
    });
  }

  return (
    <form
      action={handleSubmit}
      className="app-card-2xl mb-8 grid gap-4 p-5"
    >
      <div>
        <p className="text-sm font-medium text-emerald-400">
          Productos
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Aumento por proveedor
        </h2>

        <p className="mt-2 app-muted">
          Aplicá aumentos masivos a productos de un
          proveedor específico.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          name="supplierId"
          required
          className="app-input"
        >
          <option value="">
            Seleccionar proveedor
          </option>

          {suppliers.map((supplier) => (
            <option
              key={supplier._id}
              value={supplier._id}
            >
              {supplier.name}
            </option>
          ))}
        </select>

        <input
          name="percentage"
          type="number"
          min="1"
          placeholder="% aumento"
          required
          className="app-input"
        />

        <select
          name="roundType"
          className="app-input"
        >
          <option value="NONE">
            Sin redondeo
          </option>

          <option value="INTEGER">
            Entero
          </option>

          <option value="50">
            Redondear a 50
          </option>

          <option value="100">
            Redondear a 100
          </option>
        </select>

        <button
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending
            ? "Actualizando..."
            : "Aplicar aumento"}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </form>
  );
}