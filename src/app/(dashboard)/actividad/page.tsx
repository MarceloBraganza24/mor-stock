import { getAuditLogs } from "@/actions/audit.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actividad | MorStock",
};

export default async function ActividadPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Auditoría</p>
        <h1 className="mt-2 text-3xl font-bold">Actividad reciente</h1>
        <p className="mt-2 app-muted">
          Historial de acciones importantes dentro del comercio.
        </p>
      </div>

      <div className="grid gap-3">
        {logs.map((log: any) => (
          <div
            key={log._id}
            className="app-card-2xl p-5"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row">
              <div>
                <p className="font-semibold">{log.description}</p>
                <p className="mt-1 text-sm app-muted">
                  {log.action} · {log.entity}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Usuario: {log.user?.name || "-"}
                </p>
              </div>

              <p className="text-sm text-white/40">
                {new Date(log.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
            Todavía no hay actividad registrada.
          </div>
        )}
      </div>
    </div>
  );
}