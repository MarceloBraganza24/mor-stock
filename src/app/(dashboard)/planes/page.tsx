import { getPlanUsage } from "@/actions/store.actions";
import { plans } from "@/lib/plans";
import { createSubscriptionCheckout,cancelSubscription } from "@/actions/subscription.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes | MorStock",
};

export default async function PlanesPage() {
  const usage = await getPlanUsage();

  const planCards = Object.entries(plans);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">SaaS</p>
        <h1 className="mt-2 text-3xl font-bold">Planes</h1>
        <p className="mt-2 app-muted">
          Controlá los límites del comercio y compará funcionalidades.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="text-sm text-emerald-300">Plan actual</p>
        <h2 className="mt-2 text-3xl font-bold text-emerald-400">
          {usage.plan}
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Usage
            label="Productos"
            current={usage.productsCount}
            max={usage.limits.maxProducts}
          />

          <Usage
            label="Empleados"
            current={usage.employeesCount}
            max={usage.limits.maxEmployees}
          />
        </div>

        <p className="mt-2 text-sm text-white/60">
          Estado suscripción:{" "}
          <span className="font-semibold text-white">
            {usage.subscription?.status || "NONE"}
          </span>
        </p>

        <p className="mt-2 text-sm text-white/60">
          Plan efectivo:{" "}
          <span className="font-semibold text-white">
            {usage.effectivePlan}
          </span>
        </p>

        <p className="mt-2 text-sm text-white/60">
          Estado suscripción:{" "}
          <span className="font-semibold text-white">
            {usage.subscriptionStatus}
          </span>
        </p>
      </div>

      {usage.plan !== "FREE" && (
        <form
          action={async () => {
            "use server";
            await cancelSubscription();
          }}
          className="mt-5 mb-7"
        >
          <button className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20">
            Cancelar suscripción
          </button>
        </form>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        {planCards.map(([key, plan]) => (
          <div
            key={key}
            className={`rounded-2xl border p-5 ${
              usage.plan === key
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <p className="text-sm app-muted">Plan</p>
            <h2 className="mt-2 text-2xl font-bold">{plan.name}</h2>

            <div className="mt-5 space-y-3 text-sm text-white/70">
              <p>Productos: {plan.maxProducts}</p>
              <p>Empleados: {plan.maxEmployees}</p>
              <p>Reportes: {plan.reports ? "Sí" : "No"}</p>
              <p>Reportes avanzados: {plan.advancedReports ? "Sí" : "No"}</p>
              <p>Motomandado: {plan.delivery ? "Sí" : "No"}</p>
              <p>Compras: {plan.purchases ? "Sí" : "No"}</p>
            </div>

            {usage.plan === key ? (
              <p className="mt-5 rounded-xl cursor-pointer bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                Plan activo
              </p>
            ) : key === "FREE" ? (
              <p className="mt-6 rounded-xl cursor-pointer bg-white/10 px-4 py-3 text-center text-sm text-white/60">
                Plan gratuito
              </p>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await createSubscriptionCheckout(
                    key as "BASIC" | "PRO"
                  );
                }}
              >
                <button className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
                  Contratar {plan.name}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Usage({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number;
}) {
  const percentage = Math.min(100, Math.round((current / max) * 100));

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="font-medium">
          {current}/{max}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}