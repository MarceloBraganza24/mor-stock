import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Bike,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
  Store,
  Wallet,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MorStock",
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              MorStock
            </p>

            <h1 className="text-xl font-bold">
              Sistema inteligente para comercios
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Ingresar
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            Hecho para kioscos, mercados, despensas y comercios locales
          </p>

          <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            El sistema moderno para controlar tu comercio en tiempo real.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Ventas, stock, caja, fiados, vencimientos y motomandado en una sola
            plataforma simple, rápida y profesional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 text-center font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Empezar gratis
            </Link>

            <Link
              href="#planes"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/10 px-8 py-4 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Ver planes
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm app-muted sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Sin instalación</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Funciona desde celular y PC</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Acceso desde cualquier lugar</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/40">
            Ideal para comercios que todavía manejan stock, caja y cuentas en
            papel o Excel.
          </p>
        </div>

        {/* MOCK */}

        <div className="relative">
          <div className="absolute inset-0 rounded-[40px] bg-emerald-500/10 blur-3xl" />

          <div className="relative rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm app-muted">Dashboard general</p>

                <h3 className="mt-1 text-2xl font-bold">
                  Comercio abierto
                </h3>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                <Store size={24} />
              </div>
            </div>

            <div className="grid gap-4">
              <DashboardMock
                title="Ventas hoy"
                value="$128.500"
              />

              <DashboardMock
                title="Caja esperada"
                value="$74.200"
              />

              <DashboardMock
                title="Fiados pendientes"
                value="4 clientes"
                danger
              />

              <DashboardMock
                title="Productos por vencer"
                value="8 alertas"
              />

              <DashboardMock
                title="Pedidos delivery"
                value="3 activos"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-emerald-400">
            Funcionalidades
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Todo lo necesario para administrar tu comercio
          </h2>

          <p className="mx-auto mt-4 max-w-2xl app-muted">
            Diseñado para negocios reales que necesitan orden, control y
            simplicidad.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Feature
            icon={<ShoppingCart />}
            title="Ventas rápidas"
            text="POS moderno con lector de código de barras, métodos de pago y ventas rápidas."
          />

          <Feature
            icon={<Boxes />}
            title="Stock y vencimientos"
            text="Administrá stock, lotes y productos por vencer con alertas automáticas."
          />

          <Feature
            icon={<CreditCard />}
            title="Cobros"
            text="Visualizá cuánto dinero ingresó por cada método de pago en tiempo real."
          />

          <Feature
            icon={<Wallet />}
            title="Caja diaria"
            text="Controlá apertura, cierre y movimientos de caja de forma simple."
          />

          <Feature
            icon={<BarChart3 />}
            title="Reportes"
            text="Ventas, ganancias, productos más vendidos y exportación CSV."
          />

          <Feature
            icon={<Bike />}
            title="Motomandado"
            text="Solicitudes de entrega y panel mobile para repartidores."
          />

          <Feature
            icon={<ShieldCheck />}
            title="Roles y permisos"
            text="Dueño, cajero, repositor y motomandado con accesos separados."
          />

          <Feature
            icon={<AlertTriangle />}
            title="Alertas inteligentes"
            text="Recibí alertas de stock bajo, productos vencidos y problemas importantes."
          />

          <Feature
            icon={<Store />}
            title="Multi comercio"
            text="Cada negocio maneja su información y empleados de forma independiente."
          />
        </div>
      </section>

      {/* PLANES */}

      <section
        id="planes"
        className="mx-auto max-w-7xl px-4 py-20"
      >
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-emerald-400">
            Planes
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Elegí según el tamaño de tu comercio
          </h2>

          <p className="mx-auto mt-4 max-w-2xl app-muted">
            Empezá gratis y escalá cuando necesites más funcionalidades.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Plan
            name="Gratis"
            price="Gratis"
            items={[
              "50 productos",
              "1 empleado",
              "Ventas y caja",
              "Stock básico",
            ]}
          />

          <Plan
            name="Básico"
            price="Próximamente"
            featured
            items={[
              "500 productos",
              "3 empleados",
              "Compras",
              "Motomandado",
              "Reportes simples",
            ]}
          />

          <Plan
            name="Pro"
            price="Próximamente"
            items={[
              "5000 productos",
              "10 empleados",
              "Reportes avanzados",
              "Vencimientos por lote",
              "Soporte prioritario",
            ]}
          />
        </div>
      </section>

      {/* CTA FINAL */}

      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <h2 className="text-4xl font-bold">
            Dejá el papel y empezá a controlar tu comercio en tiempo real.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/60">
            Stock, ventas, caja, fiados y delivery en una sola plataforma
            moderna y simple de usar.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Crear cuenta gratis
            </Link>

            <Link
              href="/login"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/10 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold">
              MorStock
            </p>

            <p className="mt-1 text-sm text-white/40">
              Sistema inteligente para comercios locales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm app-muted">
            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Ingresar
            </Link>

            <Link
              href="/register"
              className="transition hover:text-white"
            >
              Crear cuenta
            </Link>

            <a
              href="#planes"
              className="transition hover:text-white"
            >
              Planes
            </a>
          </div>
        </div>
      </footer>

      {/* MOBILE CTA */}

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <Link
          href="/register"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-center font-semibold text-neutral-950 shadow-2xl transition hover:bg-emerald-400"
        >
          Empezar gratis
        </Link>
      </div>
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
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:border-emerald-500/20 hover:bg-white/[0.04]">
      <p className="text-sm app-muted">
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          danger
            ? "text-red-400"
            : "text-emerald-400"
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-500/20 hover:bg-white/[0.05]">
      <div className="mb-5 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-relaxed app-muted">
        {text}
      </p>
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
      className={`rounded-3xl border p-6 transition ${
        featured
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {featured && (
        <div className="mb-5 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-neutral-950">
          Más elegido
        </div>
      )}

      <h3 className="text-2xl font-bold">
        {name}
      </h3>

      <p className="mt-4 text-4xl font-bold text-emerald-400">
        {price}
      </p>

      <ul className="mt-8 space-y-4 text-white/60">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3"
          >
            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400"
      >
        Empezar
      </Link>
    </div>
  );
}