import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/actions/auth.actions";
import { canAccess } from "@/lib/permissions";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  LogOut,
  UserCog,
  RefreshCcw,
  Menu,
  BarChart3,
  Truck,
  ClipboardList,
  ReceiptText,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "dashboard" },
  { label: "Productos", href: "/productos", icon: Package, section: "productos" },
  { label: "Ventas", href: "/ventas", icon: ShoppingCart, section: "ventas" },
  { label: "Clientes", href: "/clientes", icon: Users, section: "clientes" },
  { label: "Caja", href: "/caja", icon: Wallet, section: "caja" },
  { label: "Devoluciones", href: "/devoluciones", icon: RefreshCcw, section: "devoluciones" },
  { label: "Empleados", href: "/empleados", icon: UserCog, section: "empleados" },
  {
    label: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    section: "reportes",
  },
  {
    label: "Envíos",
    href: "/envios",
    icon: Truck,
    section: "envios",
  },
  {
    label: "Motomandado",
    href: "/motomandado",
    icon: Truck,
    section: "motomandado",
  },
  {
    label: "Compras",
    href: "/compras",
    icon: ClipboardList,
    section: "compras",
  },
  {
    label: "Cobros",
    href: "/cobros",
    icon: ReceiptText,
    section: "cobros",
  },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const visibleNavItems = navItems.filter((item) =>
    canAccess(role, item.section)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-neutral-950 p-5 lg:block">
        <SidebarContent
          role={role}
          visibleNavItems={visibleNavItems}
        />
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/95 px-4 py-4 backdrop-blur lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <div>
              <p className="text-sm text-emerald-400">Stock Local</p>
              <h1 className="font-semibold">{session.user.name}</h1>
            </div>

            <div className="rounded-xl border border-white/10 p-2">
              <Menu size={20} />
            </div>
          </summary>

          <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <SidebarContent
              role={role}
              visibleNavItems={visibleNavItems}
              mobile
            />
          </div>
        </details>
      </header>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 hidden border-b border-white/10 bg-neutral-950/90 px-8 py-4 backdrop-blur lg:block">
          <div>
            <p className="text-sm text-white/50">Bienvenido</p>
            <h1 className="text-xl font-semibold">
              {session.user.name || "Usuario"}
            </h1>
          </div>
        </header>

        <section className="p-4 sm:p-6 lg:p-8">{children}</section>
      </main>
    </div>
  );
}

function SidebarContent({
  role,
  visibleNavItems,
  mobile = false,
}: {
  role?: string;
  visibleNavItems: typeof navItems;
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "" : "h-full"}>
      {!mobile && (
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">Stock Local</p>
          <h2 className="mt-1 text-xl font-bold">Panel del comercio</h2>

          <RoleBadge role={role} />
        </div>
      )}

      {mobile && <RoleBadge role={role} />}

      <nav className="mt-4 space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form
        action={logoutUser}
        className={mobile ? "mt-4" : "absolute bottom-5 left-5 right-5"}
      >
        <button className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  return (
    <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
      {role === "OWNER" && "Dueño"}
      {role === "CASHIER" && "Cajero"}
      {role === "STOCKER" && "Repositor"}
      {role === "SUPER_ADMIN" && "Super admin"}
      {role === "DELIVERY" && "Motomandado"}
    </p>
  );
}