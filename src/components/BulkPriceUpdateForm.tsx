"use client";

import { useState, useTransition } from "react";
import { applyBulkPriceUpdate } from "@/actions/bulk-price.actions";

export function BulkPriceUpdateForm({
  categories,
  brands,
}: {
  categories: string[];
  brands: string[];
}) {
  const [filterType, setFilterType] = useState<"ALL" | "CATEGORY" | "BRAND">(
    "ALL"
  );
  const [filterValue, setFilterValue] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [roundTo, setRoundTo] = useState("10");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await applyBulkPriceUpdate({
        filterType,
        filterValue,
        percentage: Number(percentage),
        roundTo: Number(roundTo),
      });

      if (!result.success) {
        setError(result.error || "No se pudo actualizar.");
        return;
      }

      setMessage(result.message || "Precios actualizados correctamente.");
    });
  }

  return (
    <section className="app-card-2xl mb-8 p-5">
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-400">
          Precios
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Aumento masivo
        </h2>

        <p className="mt-2 app-muted">
          Actualizá precios por categoría, marca o todos los productos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as any);
            setFilterValue("");
          }}
          className="app-input"
        >
          <option value="ALL">Todos</option>
          <option value="CATEGORY">Categoría</option>
          <option value="BRAND">Marca</option>
        </select>

        {filterType === "CATEGORY" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="app-input"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {filterType === "BRAND" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="app-input"
          >
            <option value="">Seleccionar marca</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        )}

        <input
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          type="number"
          placeholder="% aumento"
          className="app-input"
        />

        <select
          value={roundTo}
          onChange={(e) => setRoundTo(e.target.value)}
          className="app-input"
        >
          <option value="1">Sin redondeo</option>
          <option value="10">Redondear a $10</option>
          <option value="50">Redondear a $50</option>
          <option value="100">Redondear a $100</option>
          <option value="500">Redondear a $500</option>
        </select>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Actualizando..." : "Aplicar aumento"}
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
    </section>
  );
}