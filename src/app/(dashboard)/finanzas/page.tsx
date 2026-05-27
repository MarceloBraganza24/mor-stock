import { getFinanceReport } from "@/actions/finance.actions";

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function FinanzasPage({ searchParams }: Props) {
  const params = await searchParams;

  const report = await getFinanceReport({
    from: params.from,
    to: params.to,
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Finanzas generales
        </p>
        <h1 className="mt-2 text-3xl font-bold">Reporte financiero</h1>
        <p className="mt-2 app-muted">
          Ventas, compras, egresos, ingresos y flujo neto del período.
        </p>
      </div>

      <form
        action="/finanzas"
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
          Filtrar
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Ventas" value={`$${report.totalSales}`} />
        <Card title="Ganancia estimada" value={`$${report.totalProfit}`} good />
        <Card title="Compras" value={`$${report.totalPurchases}`} danger />
        <Card title="Ingresos manuales" value={`$${report.manualIncomes}`} />
        <Card title="Egresos manuales" value={`$${report.manualExpenses}`} danger />
        <Card
          title="Flujo neto"
          value={`$${report.netCashFlow}`}
          good={report.netCashFlow >= 0}
          danger={report.netCashFlow < 0}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  good,
  danger,
}: {
  title: string;
  value: string;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="app-card-2xl p-5">
      <p className="text-sm app-muted">{title}</p>
      <h2
        className={`mt-3 text-3xl font-bold ${
          good ? "text-emerald-400" : danger ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}