import Link from "next/link";
import { CheckCircle2, Circle, Store, Package, Wallet } from "lucide-react";
import { getOnboardingStatus } from "@/actions/store.actions";

export default async function OnboardingPage() {
  const status = await getOnboardingStatus();

  const steps = [
    {
      title: "Completar datos del negocio",
      description: "Nombre, ciudad, rubro, moneda, horarios y datos de contacto.",
      completed: status.storeCompleted,
      href: "/configuracion",
      icon: Store,
    },
    {
      title: "Cargar primer producto",
      description: "Agregá al menos un producto con precio, stock y categoría.",
      completed: status.firstProductCreated,
      href: "/productos",
      icon: Package,
    },
    {
      title: "Abrir primera caja",
      description: "Abrí caja para empezar a controlar el efectivo físico.",
      completed: status.firstCashOpened,
      href: "/caja",
      icon: Wallet,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Primeros pasos</p>
        <h1 className="mt-2 text-3xl font-bold">Onboarding del comercio</h1>
        <p className="mt-2 app-muted">
          Dejá listo el comercio para operar ventas, stock, caja y reportes.
        </p>
      </div>

      <div
        className={`mb-8 rounded-2xl border p-5 ${
          status.completed
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <p className="text-sm app-muted">Estado general</p>

        <h2
          className={`mt-2 text-2xl font-bold ${
            status.completed ? "text-emerald-400" : "text-white"
          }`}
        >
          {status.completed
            ? "Onboarding completado"
            : "Todavía faltan pasos"}
        </h2>

        <p className="mt-2 app-muted">
          Plan actual: <span className="text-white">{status.plan}</span>
        </p>
      </div>

      <div className="grid gap-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <Link
              key={step.title}
              href={step.href}
              className="app-card-2xl p-5 transition hover:bg-white/[0.06]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/10 p-3 text-emerald-400">
                  <Icon size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{step.title}</h2>

                    {step.completed ? (
                      <CheckCircle2 className="text-emerald-400" />
                    ) : (
                      <Circle className="text-white/30" />
                    )}
                  </div>

                  <p className="mt-2 app-muted">{step.description}</p>

                  <p className="mt-4 text-sm font-medium text-emerald-400">
                    {step.completed ? "Completado" : "Completar paso"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}