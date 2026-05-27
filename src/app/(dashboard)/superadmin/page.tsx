import {
  getSuperAdminDashboard,
  toggleStoreStatus,
  updateStorePlan,
} from "@/actions/superadmin.actions";

export default async function SuperAdminPage() {
  const data = await getSuperAdminDashboard();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">SaaS Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Super Admin</h1>
        <p className="mt-2 app-muted">
          Control general de comercios, planes, usuarios y estado del sistema.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card title="Comercios" value={data.stores.length} />
        <Card title="Usuarios" value={data.usersCount} />
        <Card title="Productos activos" value={data.productsCount} />
        <Card title="Ventas registradas" value={data.salesCount} />
      </div>

      <section className="app-card-2xl p-5">
        <h2 className="text-xl font-semibold">Comercios registrados</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Comercio</th>
                <th className="px-4 py-3">Dueño</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Suscripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Cambiar plan</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {data.stores.map((store: any) => (
                <tr key={store._id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{store.name}</td>

                  <td className="px-4 py-3 text-white/60">
                    {store.owner?.name || "-"}
                    <br />
                    <span className="text-xs text-white/40">
                      {store.owner?.email || ""}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {store.city || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      {store.plan}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {store.subscription?.status || "NONE"}
                  </td>

                  <td className="px-4 py-3">
                    {store.isActive ? (
                      <span className="text-emerald-400">Activo</span>
                    ) : (
                      <span className="text-red-400">Suspendido</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {["FREE", "BASIC", "PRO"].map((plan) => (
                        <form
                          key={plan}
                          action={async () => {
                            "use server";
                            await updateStorePlan(
                              store._id,
                              plan as "FREE" | "BASIC" | "PRO"
                            );
                          }}
                        >
                          <button className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20">
                            {plan}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <a
                      href={`/superadmin/comercios/${store._id}`}
                      className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Ver detalle
                    </a>
                  </td>

                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleStoreStatus(store._id, !store.isActive);
                      }}
                    >
                      <button
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          store.isActive
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {store.isActive ? "Suspender" : "Activar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {data.stores.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no hay comercios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="app-card-2xl p-5">
      <p className="text-sm app-muted">{title}</p>
      <h2 className="mt-3 text-3xl font-bold">{value}</h2>
    </div>
  );
}