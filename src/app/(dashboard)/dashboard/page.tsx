import Link from "next/link";
import {
  AlertTriangle,
  Box,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { getDashboardMetrics } from "@/actions/dashboard.actions";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

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
        <p className="text-sm font-medium text-emerald-400">Resumen general</p>
        <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/50">
          Estado real del comercio: ventas, caja, stock y fiados.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ventas hoy"
          value={`$${metrics.totalSalesToday}`}
          subtitle={`${metrics.salesCountToday} ventas registradas`}
          icon={<DollarSign size={22} />}
        />

        <MetricCard
          title="Ganancia estimada"
          value={`$${metrics.totalProfitToday}`}
          subtitle="Según precio costo vs venta"
          icon={<ShoppingCart size={22} />}
        />

        <MetricCard
          title="Productos activos"
          value={metrics.productsCount}
          subtitle={`${metrics.lowStockCount} con stock bajo`}
          icon={<Box size={22} />}
        />

        <MetricCard
          title="Total fiado"
          value={`$${metrics.totalDebt}`}
          subtitle={`${metrics.customersWithDebtCount} clientes deben`}
          icon={<Users size={22} />}
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Ventas por método de pago</h2>
              <p className="mt-1 text-sm text-white/50">
                Resumen de cobros del día.
              </p>
            </div>

            <CreditCard className="text-emerald-400" size={24} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <div
                key={method}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <p className="text-sm text-white/50">{method}</p>
                <p className="mt-2 text-2xl font-bold">
                  ${metrics.salesByPaymentMethod[method] || 0}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`rounded-2xl border p-5 ${
            metrics.openCashRegister
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-red-500/20 bg-red-500/10"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Estado de caja</h2>
              <p className="mt-1 text-sm text-white/50">
                Control del efectivo físico.
              </p>
            </div>

            <Wallet size={24} />
          </div>

          {metrics.openCashRegister ? (
            <div>
              <p className="text-sm text-emerald-300">Caja abierta</p>
              <p className="mt-3 text-3xl font-bold">
                ${metrics.openCashRegister.expectedAmount}
              </p>
              <p className="mt-1 text-sm text-white/50">Esperado en caja</p>

              <Link
                href="/caja"
                className="mt-5 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
              >
                Ver caja
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-red-300">Caja cerrada</p>
              <p className="mt-3 text-2xl font-bold">Sin caja abierta</p>
              <p className="mt-1 text-sm text-white/50">
                Abrí caja antes de empezar a vender en efectivo.
              </p>

              <Link
                href="/caja"
                className="mt-5 inline-flex rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                Abrir caja
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Stock bajo</h2>
            <AlertTriangle className="text-red-400" size={22} />
          </div>

          <div className="space-y-3">
            {metrics.lowStockProducts.map((product: any) => (
              <div
                key={product._id}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <p className="font-medium">{product.name}</p>
                <p className="mt-1 text-sm text-white/50">
                  Stock: {product.stock} · Mínimo: {product.minStock}
                </p>
              </div>
            ))}

            {metrics.lowStockProducts.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
                No hay productos con stock bajo.
              </p>
            )}
          </div>

          <Link
            href="/productos"
            className="mt-5 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Ver productos
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-5 text-xl font-semibold">Últimas ventas</h2>

          <div className="space-y-3">
            {metrics.recentSales.map((sale: any) => (
              <div
                key={sale._id}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">${sale.total}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {sale.paymentMethod}
                      {sale.customer?.name ? ` · ${sale.customer.name}` : ""}
                    </p>
                  </div>

                  <p className="text-xs text-white/40">
                    {new Date(sale.createdAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {metrics.recentSales.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
                Todavía no hay ventas.
              </p>
            )}
          </div>

          <Link
            href="/ventas"
            className="mt-5 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Ir a ventas
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-5 text-xl font-semibold">Movimientos de caja</h2>

          <div className="space-y-3">
            {metrics.recentCashMovements.map((movement: any) => (
              <div
                key={movement._id}
                className="rounded-xl border border-white/10 bg-neutral-900 p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p
                      className={`font-medium ${
                        movement.type === "EGRESO"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {movement.type === "EGRESO" ? "-" : "+"}${movement.amount}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      {movement.description || movement.source}
                    </p>
                  </div>

                  <p className="text-xs text-white/40">
                    {new Date(movement.createdAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {metrics.recentCashMovements.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
                No hay movimientos de caja abiertos.
              </p>
            )}
          </div>

          <Link
            href="/caja"
            className="mt-5 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Ver caja
          </Link>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{title}</p>
        <div className="text-emerald-400">{icon}</div>
      </div>

      <h2 className="mt-4 text-3xl font-bold">{value}</h2>
      <p className="mt-2 text-sm text-white/40">{subtitle}</p>
    </div>
  );
}