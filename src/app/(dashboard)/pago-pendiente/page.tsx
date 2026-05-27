import Link from "next/link";
import { Clock } from "lucide-react";

export default function PagoPendientePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Clock size={34} />
        </div>

        <h1 className="text-3xl font-bold">
          Pago pendiente de confirmación
        </h1>

        <p className="mt-4 text-white/50">
          Tu plan se activará automáticamente cuando Mercado Pago confirme la
          suscripción.
        </p>

        <p className="mt-3 text-sm text-white/40">
          Si ya realizaste el pago, no hace falta que hagas nada más.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/planes"
            className="flex-1 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Ver estado del plan
          </Link>

          <Link
            href="/dashboard"
            className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}