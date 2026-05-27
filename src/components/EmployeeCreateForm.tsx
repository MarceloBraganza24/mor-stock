"use client";

import { useState, useTransition } from "react";
import { createEmployee } from "@/actions/employee.actions";
import { FormMessage } from "@/components/ui/FormMessage";

export function EmployeeCreateForm() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const result = await createEmployee(formData);

      if (!result.success) {
        setError(result.error || "Ocurrió un error");
        return;
      }

      setSuccess(result.message || "Empleado creado correctamente.");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mb-8 grid gap-4 app-card-2xl p-5 md:grid-cols-5"
    >
      <input name="name" placeholder="Nombre" required className="app-input outline-none focus:border-emerald-500" />
      <input name="email" type="email" placeholder="Email" required className="app-input outline-none focus:border-emerald-500" />
      <input name="password" type="password" placeholder="Contraseña" required className="app-input outline-none focus:border-emerald-500" />

      <select name="role" required className="app-input outline-none focus:border-emerald-500">
        <option value="">Seleccionar rol</option>
        <option value="CASHIER">Cajero: ventas + caja</option>
        <option value="STOCKER">Repositor: productos + stock</option>
        <option value="DELIVERY">Motomandado: panel de entregas</option>
      </select>

      <button
        disabled={isPending}
        className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear empleado"}
      </button>

      <div className="md:col-span-5 space-y-3">
        <FormMessage message={success} type="success" />
        <FormMessage message={error} type="error" />
      </div>
    </form>
  );
}