"use client";

import { useState, useTransition } from "react";
import { createPromotion } from "@/actions/promotion.actions";

export function PromotionCreateForm({
  products,
  categories,
  brands,
}: {
  products: any[];
  categories: string[];
  brands: string[];
}) {
  const [type, setType] = useState("BUY_X_PAY_Y");
  const [scope, setScope] = useState("PRODUCT");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await createPromotion(formData);

      if (!result.success) {
        setError(result.error || "No se pudo crear la promoción.");
        return;
      }

      setMessage(result.message || "Promoción creada correctamente.");
    });
  }

  return (
    <form action={handleSubmit} className="app-card-2xl mb-8 grid gap-4 p-5">
      <div>
        <p className="text-sm font-medium text-emerald-400">Promociones</p>
        <h2 className="mt-2 text-2xl font-bold">Nueva promoción</h2>
        <p className="mt-2 app-muted">
          Creá descuentos, precios especiales o promos tipo 2x1 / 3x2.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="name"
          placeholder="Nombre de la promo"
          className="app-input"
          required
        />

        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="app-input"
        >
          <option value="BUY_X_PAY_Y">Compra X paga Y</option>
          <option value="PERCENTAGE">% descuento</option>
          <option value="FIXED_PRICE">Precio fijo</option>
        </select>

        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="app-input"
        >
          <option value="PRODUCT">Producto</option>
          <option value="CATEGORY">Categoría</option>
          <option value="BRAND">Marca</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {scope === "PRODUCT" && (
          <select name="product" className="app-input">
            <option value="">Seleccionar producto</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - ${product.salePrice}
              </option>
            ))}
          </select>
        )}

        {scope === "CATEGORY" && (
          <select name="category" className="app-input">
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {scope === "BRAND" && (
          <select name="brand" className="app-input">
            <option value="">Seleccionar marca</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        )}

        {type === "PERCENTAGE" && (
          <input
            name="percentage"
            type="number"
            placeholder="% descuento"
            className="app-input"
          />
        )}

        {type === "FIXED_PRICE" && (
          <input
            name="fixedPrice"
            type="number"
            placeholder="Precio fijo final"
            className="app-input"
          />
        )}

        {type === "BUY_X_PAY_Y" && (
          <>
            <input
              name="buyQuantity"
              type="number"
              placeholder="Compra X"
              className="app-input"
            />

            <input
              name="payQuantity"
              type="number"
              placeholder="Paga Y"
              className="app-input"
            />
          </>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="startsAt"
          type="date"
          className="app-input"
        />

        <input
          name="endsAt"
          type="date"
          className="app-input"
        />

        <button
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Crear promoción"}
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