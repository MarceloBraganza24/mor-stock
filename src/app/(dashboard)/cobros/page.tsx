import { getPaymentsReport } from "@/actions/payment.actions";

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function CobrosPage({ searchParams }: Props) {
  const params = await searchParams;

  const report = await getPaymentsReport({
    from: params.from,
    to: params.to,
  });

  const methods = ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "QR"];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Dinero cobrado
        </p>
        <h1 className="mt-2 text-3xl font-bold">Cobros</h1>
        <p className="mt-2 text-white/50">
          Controlá toda la plata cobrada, separada de la caja física.
        </p>
      </div>

      <form
        action="/cobros"
        className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-3"
      >
        <input
          name="from"
          type="date"
          defaultValue={params.from || ""}
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          name="to"
          type="date"
          defaultValue={params.to || ""}
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
          Filtrar cobros
        </button>
      </form>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card
          title="Total cobrado"
          value={`$${report.totalCollected}`}
          highlight
        />

        <Card
          title="Ventas cobradas"
          value={`$${report.totalDirectSales}`}
        />

        <Card
          title="Pagos de fiado"
          value={`$${report.totalCreditPayments}`}
        />

        <Card
          title="Fiado pendiente"
          value={`$${report.totalPendingDebt}`}
          danger
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold">Ventas por método</h2>
          <p className="mt-1 text-sm text-white/50">
            Plata cobrada directamente en ventas.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => (
              <div
                key={method}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <p className="text-sm text-white/50">{method}</p>
                <p className="mt-2 text-2xl font-bold">
                  ${report.salesByMethod[method] || 0}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">Ventas fiadas generadas</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              ${report.fiadoSales}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold">Pagos de fiado por método</h2>
          <p className="mt-1 text-sm text-white/50">
            Plata que entró por clientes que debían.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => (
              <div
                key={method}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <p className="text-sm text-white/50">{method}</p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  ${report.creditPaymentsByMethod[method] || 0}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mb-8">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Movimientos
          </p>
          <h2 className="mt-2 text-2xl font-bold">Historial de cobros</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Monto</th>
              </tr>
            </thead>

            <tbody>
              {report.movements.map((movement: any) => (
                <tr key={movement.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/60">
                    {new Date(movement.date).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3">{movement.type}</td>
                  <td className="px-4 py-3 text-white/70">
                    {movement.method}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {movement.customer}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {movement.user}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {movement.description}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    ${movement.amount}
                  </td>
                </tr>
              ))}

              {report.movements.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    No hay cobros en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm font-medium text-red-400">Pendientes</p>
          <h2 className="mt-2 text-2xl font-bold">Clientes con deuda</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {report.customersWithDebt.map((customer: any) => (
            <div
              key={customer._id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="font-semibold">{customer.name}</p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                ${customer.balance}
              </p>
            </div>
          ))}

          {report.customersWithDebt.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40 md:col-span-2 xl:col-span-3">
              No hay clientes con deuda pendiente.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  highlight,
  danger,
}: {
  title: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-white/50">{title}</p>
      <h2
        className={`mt-3 text-2xl font-bold ${
          highlight
            ? "text-emerald-400"
            : danger
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}