import { getSalesReport } from "@/actions/report.actions";

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function ReportesPage({ searchParams }: Props) {
  const params = await searchParams;

  const report = await getSalesReport({
    from: params.from,
    to: params.to,
  });

  const exportUrl = `/api/reportes/ventas?from=${params.from || ""}&to=${
    params.to || ""
    }`;

  const paymentMethods = [
    "EFECTIVO",
    "TRANSFERENCIA",
    "DEBITO",
    "CREDITO",
    "QR",
    "FIADO",
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Análisis del negocio
        </p>
        <h1 className="mt-2 text-3xl font-bold">Reportes</h1>
        <p className="mt-2 app-muted">
          Analizá ventas, ganancias, métodos de pago y productos más vendidos.
        </p>
      </div>

      <form
        action="/reportes"
        className="mb-8 grid gap-4 app-card-2xl p-5 md:grid-cols-3"
      >
        <input
          name="from"
          type="date"
          defaultValue={params.from || ""}
          className="app-input outline-none focus:border-emerald-500"
        />

        <input
          name="to"
          type="date"
          defaultValue={params.to || ""}
          className="app-input outline-none focus:border-emerald-500"
        />

        <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
          Filtrar reporte
        </button>
      </form>

        <a
        href={exportUrl}
        className="mb-8 inline-flex rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
        >
        Exportar ventas CSV
        </a>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Ventas</p>
          <h2 className="mt-3 text-3xl font-bold">{report.totalSales}</h2>
        </div>

        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Facturación</p>
          <h2 className="mt-3 text-3xl font-bold">${report.totalRevenue}</h2>
        </div>

        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Ganancia estimada</p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-400">
            ${report.totalProfit}
          </h2>
        </div>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <section className="app-card-2xl p-5">
          <h2 className="text-xl font-semibold">Métodos de pago</h2>
          <p className="mt-1 text-sm app-muted">
            Total vendido por cada método.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => (
              <div
                key={method}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <p className="text-sm app-muted">{method}</p>
                <p className="mt-2 text-2xl font-bold">
                  ${report.salesByPaymentMethod[method] || 0}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="app-card-2xl p-5">
          <h2 className="text-xl font-semibold">Resumen rápido</h2>
          <p className="mt-1 text-sm app-muted">
            Indicadores básicos del período.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between rounded-xl bg-neutral-900 p-4">
              <span className="text-white/60">Ticket promedio</span>
              <span className="font-semibold">
                $
                {report.totalSales > 0
                  ? Math.round(report.totalRevenue / report.totalSales)
                  : 0}
              </span>
            </div>

            <div className="flex justify-between rounded-xl bg-neutral-900 p-4">
              <span className="text-white/60">Margen estimado</span>
              <span className="font-semibold text-emerald-400">
                {report.totalRevenue > 0
                  ? Math.round((report.totalProfit / report.totalRevenue) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Ranking de productos
          </p>
          <h2 className="mt-2 text-2xl font-bold">Productos más vendidos</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Unidades vendidas</th>
                <th className="px-4 py-3">Facturación</th>
                <th className="px-4 py-3">Ganancia estimada</th>
              </tr>
            </thead>

            <tbody>
              {report.topProducts.map((product: any) => (
                <tr key={product.name} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">${product.revenue}</td>
                  <td className="px-4 py-3 text-emerald-400">
                    ${product.profit}
                  </td>
                </tr>
              ))}

              {report.topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    No hay ventas para este período.
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