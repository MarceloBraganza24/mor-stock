import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Bike,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-sm font-medium text-emerald-400">MorStock Lab</p>
            <h1 className="text-xl font-bold">SaaS para comercios</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white"
            >
              Ingresar
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            Pensado para kioscos, mercados y despensas
          </p>

          <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
            Controlá ventas, stock, caja y fiados desde un solo lugar.
          </h2>

          <p className="mt-6 max-w-xl text-lg text-white/60">
            Un sistema simple para comercios chicos que todavía manejan stock,
            caja y cuentas corrientes en papel.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-6 py-4 text-center font-semibold text-neutral-950 hover:bg-emerald-400"
            >
              Empezar gratis
            </Link>

            <Link
              href="#planes"
              className="rounded-xl border border-white/10 px-6 py-4 text-center font-semibold text-white hover:bg-white/10"
            >
              Ver planes
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
          <div className="grid gap-4">
            <DashboardMock title="Ventas hoy" value="$128.500" />
            <DashboardMock title="Caja esperada" value="$74.200" />
            <DashboardMock title="Fiado pendiente" value="$36.000" danger />
            <DashboardMock title="Productos por vencer" value="8 alertas" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10">
          <p className="text-sm font-medium text-emerald-400">Funcionalidades</p>
          <h2 className="mt-2 text-3xl font-bold">
            Todo lo que necesita un comercio local
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<ShoppingCart />} title="Ventas rápidas" text="POS simple con lector de código de barras, fiados y métodos de pago." />
          <Feature icon={<Boxes />} title="Stock y vencimientos" text="Control de productos, lotes, alertas de vencimiento y stock bajo." />
          <Feature icon={<CreditCard />} title="Cobros" text="Panel de cobros por efectivo, transferencia, débito, crédito, QR y fiados." />
          <Feature icon={<BarChart3 />} title="Reportes" text="Ventas, ganancias, productos más vendidos y exportación CSV." />
          <Feature icon={<Bike />} title="Motomandado" text="Solicitudes de entrega y panel mobile para repartidores." />
          <Feature icon={<ShieldCheck />} title="Roles y permisos" text="Dueño, cajero, repositor y motomandado con accesos separados." />
        </div>
      </section>

      <section id="planes" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium text-emerald-400">Planes</p>
          <h2 className="mt-2 text-3xl font-bold">
            Elegí según el tamaño del comercio
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Plan name="Gratis" price="$0" items={["50 productos", "1 empleado", "Ventas, caja y stock básico"]} />
          <Plan name="Básico" price="$30.000 ARS/mes" featured items={["500 productos", "3 empleados", "Compras y motomandado", "Reportes simples"]} />
          <Plan name="Pro" price="$50.000 ARS/mes" items={["5000 productos", "10 empleados", "Reportes avanzados", "Vencimientos por lote", "Soporte prioritario"]} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">
          Digitalizá tu comercio sin complicarte.
        </h2>

        <p className="mt-4 text-white/60">
          Empezá con ventas, caja y stock. Después sumá compras, reportes,
          vencimientos y motomandado.
        </p>

        <Link
          href="/register"
          className="mt-8 inline-flex rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Crear cuenta gratis
        </Link>
      </section>
    </main>
  );
}

function DashboardMock({
  title,
  value,
  danger,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <p className="text-sm text-white/50">{title}</p>
      <p
        className={`mt-2 text-3xl font-bold ${
          danger ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-white/50">{text}</p>
    </div>
  );
}

function Plan({
  name,
  price,
  items,
  featured,
}: {
  name: string;
  price: string;
  items: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        featured
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <h3 className="text-2xl font-bold">{name}</h3>
      <p className="mt-3 text-3xl font-bold text-emerald-400">{price}</p>

      <ul className="mt-6 space-y-3 text-white/60">
        {items.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>

      <Link
        href="/register"
        className="mt-6 inline-flex w-full justify-center rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
      >
        Empezar
      </Link>
    </div>
  );
}