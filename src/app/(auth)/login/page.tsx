import { loginUser } from "@/actions/auth.actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">MorStock</p>
          <h1 className="mt-2 text-3xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-white/50">Entrá al panel de tu comercio.</p>
        </div>

        {params.error === "credentials" && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Email o contraseña incorrectos.
          </div>
        )}

        <form action={loginUser} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400">
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}