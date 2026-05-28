"use client";

import { useState, useTransition } from "react";
import {
  addSupplierDebt,
  registerSupplierPayment,
} from "@/actions/supplier-account.actions";

export function SupplierAccountForm({
  suppliers,
}: {
  suppliers: any[];
}) {
  const [mode, setMode] = useState<"DEBT" | "PAYMENT">("DEBT");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result =
        mode === "DEBT"
          ? await addSupplierDebt(formData)
          : await registerSupplierPayment(formData);

      if (!result.success) {
        setError(result.error || "No se pudo registrar el movimiento.");
        return;
      }

      setMessage(result.message || "Movimiento registrado correctamente.");
    });
  }

  return (
    <form action={handleSubmit} className="app-card-2xl mb-8 grid gap-4 p-5">
      <div>
        <p className="text-sm font-medium text-emerald-400">Proveedores</p>
        <h2 className="mt-2 text-2xl font-bold">Cuenta corriente</h2>
        <p className="mt-2 app-muted">
          Registrá deudas y pagos a proveedores.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "DEBT" | "PAYMENT")}
          className="app-input"
        >
          <option value="DEBT">Agregar deuda</option>
          <option value="PAYMENT">Registrar pago</option>
        </select>

        <select name="supplierId" required className="app-input">
          <option value="">Seleccionar proveedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name} — deuda ${Number(supplier.balance || 0).toLocaleString("es-AR")}
            </option>
          ))}
        </select>

        <input
          name="amount"
          type="number"
          min="1"
          placeholder="Importe"
          required
          className="app-input"
        />

        <button
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Registrar"}
        </button>
      </div>

      <input
        name="description"
        placeholder="Descripción / observación"
        className="app-input"
      />

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