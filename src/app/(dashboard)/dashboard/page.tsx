import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  Boxes,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import { getDashboardMetrics } from "@/actions/dashboard.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | MorStock",
};

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

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
        <p className="text-sm font-medium text-emerald-400">
          Panel del dueño
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 app-muted">
          Estado general del comercio:
          ventas, caja, stock, cobros,
          compras y alertas.
        </p>
      </div>

      {/* ALERTAS */}

      <section className="mb-8 app-card-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Alertas y notificaciones
            </h2>

            <p className="mt-1 text-sm app-muted">
              Estado importante del
              comercio.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {metrics.notifications.map(
            (notification: any) => (
              <div
                key={notification._id}
                className={`rounded-xl border p-4 ${
                  notification.severity ===
                  "DANGER"
                    ? "border-red-500/20 bg-red-500/10"
                    : notification.severity ===
                      "WARNING"
                    ? "border-amber-500/20 bg-amber-500/10"
                    : "border-emerald-500/20 bg-emerald-500/10"
                }`}
              >
                <p className="font-medium">
                  {notification.title}
                </p>

                <p className="mt-1 text-sm text-white/60">
                  {
                    notification.description
                  }
                </p>
              </div>
            )
          )}

          {metrics.notifications
            .length === 0 && (
            <EmptyText text="No hay alertas activas." />
          )}
        </div>
      </section>

      <div className="mb-8 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ventas hoy"
          value={`$${metrics.totalSalesToday}`}
          subtitle={`${metrics.salesCountToday} ventas registradas`}
          icon={<DollarSign size={22} />}
        />

        <MetricCard
          title="Ganancia estimada"
          value={`$${metrics.totalProfitToday}`}
          subtitle="Precio venta menos costo"
          icon={
            <ShoppingCart size={22} />
          }
        />

        <MetricCard
          title="Compras hoy"
          value={`$${metrics.totalPurchasesToday}`}
          subtitle="Mercadería registrada"
          icon={<Package size={22} />}
          danger
        />

        <MetricCard
          title="Neto del día"
          value={`$${metrics.netToday}`}
          subtitle="Ventas menos compras"
          icon={
            <CreditCard size={22} />
          }
          danger={metrics.netToday < 0}
        />
      </div>

      <div className="mb-8 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Productos activos"
          value={metrics.productsCount}
          subtitle={`${metrics.lowStockCount} con stock bajo`}
          icon={<Boxes size={22} />}
        />

        <MetricCard
          title="Por vencer"
          value={metrics.expiringCount}
          subtitle="Dentro de los próximos 30 días"
          icon={
            <AlertTriangle size={22} />
          }
          danger={
            metrics.expiringCount > 0
          }
        />

        <MetricCard
          title="Fiado pendiente"
          value={`$${metrics.totalDebt}`}
          subtitle={`${metrics.customersWithDebt.length} clientes con deuda`}
          icon={<Users size={22} />}
          danger={metrics.totalDebt > 0}
        />

        <MetricCard
          title="Envíos activos"
          value={
            metrics.pendingDeliveries
              .length
          }
          subtitle="Pendientes, tomados o en camino"
          icon={<Bike size={22} />}
        />
      </div>

      <div className="mb-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className={cardClass}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Ventas por método de
                pago
              </h2>

              <p className="mt-1 text-sm app-muted">
                Cobros registrados en
                ventas del día.
              </p>
            </div>

            <CreditCard
              className="text-emerald-400"
              size={24}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map(
              (method) => (
                <div
                  key={method}
                  className="rounded-xl border border-white/10 bg-neutral-900 p-4"
                >
                  <p className="text-sm app-muted">
                    {method}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    $
                    {metrics
                      .salesByPaymentMethod[
                      method
                    ] || 0}
                  </p>
                </div>
              )
            )}
          </div>

          <Link
            href="/cobros"
            className="mt-5 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Ver panel de cobros
          </Link>
        </section>

        <section
          className={`rounded-2xl border p-5 ${
            metrics.openCashRegister
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-red-500/20 bg-red-500/10"
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Estado de caja
              </h2>

              <p className="mt-1 text-sm app-muted">
                Control del efectivo
                físico.
              </p>
            </div>

            <Wallet size={24} />
          </div>

          {metrics.openCashRegister ? (
            <>
              <p className="text-sm text-emerald-300">
                Caja abierta
              </p>

              <p className="mt-3 text-4xl font-bold">
                $
                {
                  metrics
                    .openCashRegister
                    .expectedAmount
                }
              </p>

              <p className="mt-1 text-sm app-muted">
                Esperado en caja
              </p>

              <Link
                href="/caja"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
              >
                Ver caja
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-red-300">
                Caja cerrada
              </p>

              <p className="mt-3 text-2xl font-bold">
                Sin caja abierta
              </p>

              <p className="mt-1 text-sm app-muted">
                Abrí caja antes de
                vender en efectivo.
              </p>

              <Link
                href="/caja"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Abrir caja
              </Link>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <Panel
          title="Stock bajo"
          href="/productos"
          hrefLabel="Ver productos"
        >
          {metrics.lowStockProducts.map(
            (product: any) => (
              <MiniItem
                key={product._id}
                title={product.name}
                subtitle={`Stock: ${product.stock} · Mínimo: ${product.minStock}`}
                danger
              />
            )
          )}

          {metrics.lowStockProducts
            .length === 0 && (
            <EmptyText text="No hay productos con stock bajo." />
          )}
        </Panel>

        <Panel
          title="Productos por vencer"
          href="/vencimientos"
          hrefLabel="Ver vencimientos"
        >
          {metrics.expiringBatches.map(
            (batch: any) => {
              const expiration =
                new Date(
                  batch.expirationDate
                );

              const today = new Date();

              const diffDays =
                Math.ceil(
                  (expiration.getTime() -
                    today.getTime()) /
                    (1000 *
                      60 *
                      60 *
                      24)
                );

              return (
                <MiniItem
                  key={batch._id}
                  title={
                    batch.product
                      ?.name ||
                    "Producto"
                  }
                  subtitle={`Cant: ${
                    batch.quantity
                  } · ${
                    diffDays < 0
                      ? "Vencido"
                      : diffDays === 0
                      ? "Vence hoy"
                      : `Vence en ${diffDays} días`
                  }`}
                  danger
                />
              );
            }
          )}

          {metrics.expiringBatches
            .length === 0 && (
            <EmptyText text="No hay productos próximos a vencer." />
          )}
        </Panel>

        <Panel
          title="Fiados"
          href="/clientes"
          hrefLabel="Ver clientes"
        >
          {metrics.customersWithDebt.map(
            (customer: any) => (
              <MiniItem
                key={customer._id}
                title={customer.name}
                subtitle={`Debe $${customer.balance}`}
                danger
              />
            )
          )}

          {metrics.customersWithDebt
            .length === 0 && (
            <EmptyText text="No hay clientes con deuda." />
          )}
        </Panel>

        <Panel
          title="Últimas ventas"
          href="/ventas"
          hrefLabel="Ir a ventas"
        >
          {metrics.recentSales.map(
            (sale: any) => (
              <MiniItem
                key={sale._id}
                title={`$${sale.total} · ${sale.paymentMethod}`}
                subtitle={`${
                  sale.user?.name ||
                  "-"
                } ${
                  sale.customer?.name
                    ? `· ${sale.customer.name}`
                    : ""
                }`}
              />
            )
          )}

          {metrics.recentSales.length ===
            0 && (
            <EmptyText text="Todavía no hay ventas." />
          )}
        </Panel>

        <Panel
          title="Movimientos de caja"
          href="/caja"
          hrefLabel="Ver caja"
        >
          {metrics.recentCashMovements.map(
            (movement: any) => (
              <MiniItem
                key={movement._id}
                title={`${
                  movement.type ===
                  "EGRESO"
                    ? "-"
                    : "+"
                }$${movement.amount}`}
                subtitle={
                  movement.description ||
                  movement.source
                }
                danger={
                  movement.type ===
                  "EGRESO"
                }
              />
            )
          )}

          {metrics
            .recentCashMovements
            .length === 0 && (
            <EmptyText text="No hay movimientos recientes." />
          )}
        </Panel>

        <Panel
          title="Envíos activos"
          href="/envios"
          hrefLabel="Ver envíos"
        >
          {metrics.pendingDeliveries.map(
            (order: any) => (
              <MiniItem
                key={order._id}
                title={`${order.customerName} · ${order.status}`}
                subtitle={`${order.address} ${
                  order.deliveryUser
                    ?.name
                    ? `· ${order.deliveryUser.name}`
                    : ""
                }`}
              />
            )
          )}

          {metrics.pendingDeliveries
            .length === 0 && (
            <EmptyText text="No hay envíos activos." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  danger,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <p className="text-sm app-muted">
          {title}
        </p>

        <div
          className={
            danger
              ? "text-red-400"
              : "text-emerald-400"
          }
        >
          {icon}
        </div>
      </div>

      <h2
        className={`mt-4 text-3xl font-bold ${
          danger
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </h2>

      <p className="mt-2 text-sm text-white/40">
        {subtitle}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
  href,
  hrefLabel,
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  hrefLabel: string;
}) {
  return (
    <section className={cardClass}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {children}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        {hrefLabel}
      </Link>
    </section>
  );
}

function MiniItem({
  title,
  subtitle,
  danger,
}: {
  title: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
      <p
        className={`font-medium ${
          danger
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-sm app-muted">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyText({
  text,
}: {
  text: string;
}) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
      {text}
    </p>
  );
}