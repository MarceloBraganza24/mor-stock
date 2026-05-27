import { getSuperAdminStoreDetail } from "@/actions/superadmin.actions";

type Props = {
  params: Promise<{ storeId: string }>;
};

export default async function StoreDetailPage({ params }: Props) {
  const { storeId } = await params;
  const data = await getSuperAdminStoreDetail(storeId);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Soporte</p>
        <h1 className="mt-2 text-3xl font-bold">{data.store?.name}</h1>
        <p className="mt-2 app-muted">
          Detalle interno del comercio para soporte y administración.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card title="Plan" value={data.store?.plan} />
        <Card title="Usuarios" value={data.users.length} />
        <Card title="Productos" value={data.productsCount} />
        <Card title="Ventas" value={data.salesCount} />
      </div>

      <section className="app-card-2xl p-5">
        <h2 className="text-xl font-semibold">Usuarios</h2>

        <div className="mt-5 grid gap-3">
          {data.users.map((user: any) => (
            <div
              key={user._id}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4"
            >
              <p className="font-medium">{user.name}</p>
              <p className="text-sm app-muted">{user.email}</p>
              <p className="text-sm text-emerald-400">{user.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="app-card-2xl p-5">
      <p className="text-sm app-muted">{title}</p>
      <h2 className="mt-3 text-2xl font-bold">{value}</h2>
    </div>
  );
}