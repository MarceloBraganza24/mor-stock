"use client";

import { useState, useTransition } from "react";
import { createDeliveryOrder } from "@/actions/delivery.actions";
import { FormMessage } from "@/components/ui/FormMessage";

export function DeliveryCreateForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const result = await createDeliveryOrder(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(result.message || "Solicitud creada correctamente.");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-3"
    >
      <input name="customerName" placeholder="Nombre del cliente" required className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="customerPhone" placeholder="Teléfono" required className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="address" placeholder="Dirección de entrega" required className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="deliveryFee" type="number" placeholder="Costo envío" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500" />
      <input name="notes" placeholder="Observaciones" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500 md:col-span-2" />

      <button
        disabled={isPending}
        className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50 md:col-span-3"
      >
        {isPending ? "Solicitando..." : "Solicitar motomandado"}
      </button>

      <div className="md:col-span-3 space-y-3">
        <FormMessage message={success} type="success" />
        <FormMessage message={error} type="error" />
      </div>
    </form>
  );
}