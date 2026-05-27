"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/actions/product.actions";
import { FormMessage } from "@/components/ui/FormMessage";

export function ProductCreateForm({
  defaultBarcode = "",
  redirectTo = "",
}: {
  defaultBarcode?: string;
  redirectTo?: string;
}) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const result = await createProduct(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(result.message || "Producto creado correctamente.");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-4"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <input name="name" placeholder="Nombre del producto" required className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="barcode" defaultValue={defaultBarcode} placeholder="Código de barras" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="category" placeholder="Categoría" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="costPrice" type="number" placeholder="Precio costo" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="salePrice" type="number" placeholder="Precio venta" required className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="stock" type="number" placeholder="Stock actual" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="minStock" type="number" placeholder="Stock mínimo" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />

      <button
        disabled={isPending}
        className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar producto"}
      </button>

      <div className="md:col-span-4 space-y-3">
        <FormMessage message={success} type="success" />
        <FormMessage message={error} type="error" />
      </div>
    </form>
  );
}