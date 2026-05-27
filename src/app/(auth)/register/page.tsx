import { registerOwner } from "@/actions/auth.actions";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm text-emerald-400 font-medium">Stock Local</p>
          <h1 className="text-3xl font-bold mt-2">Crear cuenta</h1>
          <p className="app-muted mt-2">
            Registrá tu comercio y empezá a controlar stock, ventas y fiados.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";

            await registerOwner({
              name: String(formData.get("name") || ""),
              email: String(formData.get("email") || ""),
              password: String(formData.get("password") || ""),
              storeName: String(formData.get("storeName") || ""),
              city: String(formData.get("city") || ""),
            });
          }}
          className="space-y-4"
        >
          <input
            name="name"
            placeholder="Tu nombre"
            className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 outline-none focus:border-emerald-500"
          />

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

          <input
            name="storeName"
            placeholder="Nombre del comercio"
            className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="city"
            placeholder="Ciudad"
            className="w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button className="w-full rounded-xl bg-emerald-500 text-neutral-950 font-semibold py-3 hover:bg-emerald-400 transition">
            Crear cuenta
          </button>
        </form>

        <p className="text-sm app-muted mt-6 text-center">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            Iniciar sesión
          </a>
        </p>
      </div>
    </main>
  );
}