import { loginUser } from "@/actions/auth.actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm text-emerald-400 font-medium">Stock Local</p>
          <h1 className="text-3xl font-bold mt-2">Iniciar sesión</h1>
          <p className="text-white/50 mt-2">
            Entrá al panel de tu comercio.
          </p>
        </div>

        <form action={loginUser} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button className="w-full rounded-xl bg-emerald-500 text-neutral-950 font-semibold py-3 hover:bg-emerald-400 transition">
            Ingresar
          </button>
        </form>

        <p className="text-sm text-white/50 mt-6 text-center">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="text-emerald-400 hover:underline">
            Crear cuenta
          </a>
        </p>
      </div>
    </main>
  );
}