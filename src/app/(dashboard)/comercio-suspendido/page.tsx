import { AlertTriangle, Link } from "lucide-react";

export default function ComercioSuspendidoPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-lg rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertTriangle size={34} />
        </div>

        <h1 className="text-3xl font-bold">Comercio suspendido</h1>

        <p className="mt-4 text-white/60">
          Este comercio fue suspendido temporalmente. Contactá al administrador
          del sistema para reactivar el acceso.
        </p>

        <Link
          href="/api/auth/signout?callbackUrl=/login"
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Cerrar sesión
        </Link>
      </div>
    </div>
  );
}