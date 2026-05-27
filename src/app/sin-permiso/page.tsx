import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/permissions";

export default async function SinPermisoPage() {
  const session = await auth();
  const defaultRoute = getDefaultRouteByRole(session?.user?.role);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldAlert size={32} />
        </div>

        <h1 className="text-3xl font-bold">Sin permiso</h1>

        <p className="mt-3 text-white/50">
          No tenés acceso a esta sección con tu rol actual.
        </p>

        <Link
          href={defaultRoute}
          className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Volver a mi panel
        </Link>
      </div>
    </main>
  );
}