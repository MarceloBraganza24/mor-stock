import { getSystemStatus } from "@/actions/system.actions";

export default async function EstadoPage() {
  const status = await getSystemStatus();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Sistema</p>
        <h1 className="mt-2 text-3xl font-bold">Estado del sistema</h1>
        <p className="mt-2 app-muted">
          Información general del comercio, plan y estado operativo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Versión" value={status.version} />
        <Card title="Plan activo" value={status.plan} />
        <Card title="Suscripción" value={status.subscriptionStatus} />
        <Card title="Comercio" value={status.storeStatus} />
      </div>

      <div className="mt-6 app-card-2xl p-5">
        <p className="text-sm app-muted">Último backup / restauración</p>
        <h2 className="mt-3 text-xl font-bold">
          {status.lastBackup
            ? new Date(status.lastBackup.createdAt).toLocaleString("es-AR")
            : "Sin registros"}
        </h2>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="app-card-2xl p-5">
      <p className="text-sm app-muted">{title}</p>
      <h2 className="mt-3 text-2xl font-bold">{value}</h2>
    </div>
  );
}