"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct } from "@/actions/product.actions";
import { FormMessage } from "@/components/ui/FormMessage";

const inputClass =
  "min-h-12 app-input text-base outline-none transition focus:border-emerald-500";

export function ProductCreateForm({
  defaultBarcode = "",
  redirectTo = "",
}: {
  defaultBarcode?: string;
  redirectTo?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const result = await createProduct(formData);

      if (!result.success) {
        setError(result.error || "Ocurrió un error");
        return;
      }

      setSuccess(result.message || "Producto creado correctamente.");

      if (!redirectTo) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="md:col-span-2 xl:col-span-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
          Crear producto
        </h2>
      </div>

      <input
        name="name"
        placeholder="Nombre del producto"
        required
        className={inputClass}
      />

      <input
        name="barcode"
        defaultValue={defaultBarcode}
        placeholder="Código de barras"
        className={inputClass}
      />

      <input
        name="category"
        placeholder="Categoría"
        className={inputClass}
      />

      <input
        name="brand"
        placeholder="Marca"
        className={inputClass}
      />

      <input
        name="costPrice"
        type="number"
        min="0"
        step="0.01"
        placeholder="Precio costo"
        className={inputClass}
      />

      <input
        name="salePrice"
        type="number"
        min="0"
        step="0.01"
        placeholder="Precio venta"
        required
        className={inputClass}
      />

      <input
        name="stock"
        type="number"
        min="0"
        step="1"
        placeholder="Stock actual"
        className={inputClass}
      />

      <input
        name="minStock"
        type="number"
        min="0"
        step="1"
        placeholder="Stock mínimo"
        className={inputClass}
      />

      <button
        disabled={isPending}
        className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar producto"}
      </button>

      <div className="space-y-3 md:col-span-2 xl:col-span-4">
        <FormMessage message={success} type="success" />
        <FormMessage message={error} type="error" />
      </div>
    </form>
  );
}