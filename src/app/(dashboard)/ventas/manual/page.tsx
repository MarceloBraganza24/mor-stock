import { ManualSaleForm } from "@/components/ManualSaleForm";

export default function ManualSalePage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Ventas
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Venta manual
        </h1>

        <p className="mt-2 app-muted">
          Registrá ventas rápidas sin afectar stock.
        </p>
      </div>

      <ManualSaleForm />
    </div>
  );
}