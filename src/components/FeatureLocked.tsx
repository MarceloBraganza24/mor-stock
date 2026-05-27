import Link from "next/link";
import { Lock } from "lucide-react";

export function FeatureLocked({
  title = "Módulo bloqueado",
  description = "Tu suscripción todavía no está activa.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Lock size={34} />
        </div>

        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-4 text-white/60">{description}</p>

        <Link
          href="/planes"
          className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Ver planes
        </Link>
      </div>
    </div>
  );
}