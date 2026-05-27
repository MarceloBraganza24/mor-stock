"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/ui/FormMessage";

export function RestoreBackupForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const confirmed = confirm(
        "Esto reemplazará los datos actuales del comercio. ¿Querés continuar?"
      );

      if (!confirmed) return;

      const res = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restaurar backup.");
        return;
      }

      setSuccess(data.message || "Backup restaurado correctamente.");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5"
    >
      <h2 className="text-xl font-semibold text-red-300">
        Restaurar backup
      </h2>

      <p className="mt-2 text-sm text-white/60">
        Importá un archivo JSON exportado desde el sistema. Esta acción
        reemplaza los datos actuales del comercio.
      </p>

      <input
        name="file"
        type="file"
        accept="application/json"
        required
        className="mt-4 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3"
      />

      <button
        disabled={isPending}
        className="mt-4 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-400 disabled:opacity-50"
      >
        {isPending ? "Restaurando..." : "Restaurar backup"}
      </button>

      <div className="mt-4 space-y-3">
        <FormMessage message={success} type="success" />
        <FormMessage message={error} type="error" />
      </div>
    </form>
  );
}