import Link from "next/link";
import { Package, ShoppingCart, Wallet, Users } from "lucide-react";

export function MobileBottomNav({ role }: { role?: string }) {
  const items =
    role === "CASHIER"
      ? [
          { label: "Ventas", href: "/ventas", icon: ShoppingCart },
          { label: "Caja", href: "/caja", icon: Wallet },
          { label: "Clientes", href: "/clientes", icon: Users },
        ]
      : role === "STOCKER"
      ? [{ label: "Productos", href: "/productos", icon: Package }]
      : [];

  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-neutral-950/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}