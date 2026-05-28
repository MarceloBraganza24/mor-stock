export type Role =
  | "SUPER_ADMIN"
  | "OWNER"
  | "CASHIER"
  | "STOCKER"
  | "DELIVERY";

export type Section =
  | "dashboard"
  | "productos"
  | "ventas"
  | "clientes"
  | "caja"
  | "empleados"
  | "devoluciones"
  | "reportes"
  | "envios"
  | "motomandado"
  | "compras"
  | "cobros"
  | "finanzas"
  | "vencimientos"
  | "configuracion"
  | "onboarding"
  | "planes"
  | "papelera"
  | "superadmin"
  | "soporte"
  | "estado"
  | "ayuda"
  | "actividad"
  | "promociones"
  | "combos"
  | "proveedores"
  | "ordenesCompra"

export const sectionPermissions: Record<
  Section,
  {
    roles: Role[];
    planFeature?: "reports" | "advancedReports" | "delivery" | "purchases";
  }
> = {
  dashboard: { roles: ["OWNER"] },
  productos: { roles: ["OWNER", "SUPER_ADMIN", "STOCKER"] },
  ventas: { roles: ["OWNER", "SUPER_ADMIN", "CASHIER"] },
  clientes: { roles: ["OWNER", "SUPER_ADMIN", "CASHIER"] },
  caja: { roles: ["OWNER", "SUPER_ADMIN", "CASHIER"] },
  empleados: { roles: ["OWNER", "SUPER_ADMIN"] },
  devoluciones: { roles: ["OWNER", "SUPER_ADMIN", "CASHIER"] },
  promociones: {
    roles: ["OWNER", "CASHIER"],
  },
  reportes: {
    roles: ["OWNER", "SUPER_ADMIN"],
    planFeature: "reports",
  },
  combos: {
    roles: ["OWNER", "CASHIER"],
  },
  proveedores: {
    roles: ["OWNER", "STOCKER"],
  },
  finanzas: {
    roles: ["OWNER", "SUPER_ADMIN"],
    planFeature: "advancedReports",
  },
  ordenesCompra: {
    roles: ["OWNER", "STOCKER"],
    planFeature: "purchases",
  },
  envios: {
    roles: ["OWNER", "SUPER_ADMIN", "CASHIER"],
    planFeature: "delivery",
  },

  motomandado: {
    roles: ["DELIVERY"],
  },

  compras: {
    roles: ["OWNER", "SUPER_ADMIN", "STOCKER"],
    planFeature: "purchases",
  },

  cobros: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },

  vencimientos: {
    roles: ["OWNER", "SUPER_ADMIN", "STOCKER"],
  },

  configuracion: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },

  onboarding: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },

  planes: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },

  papelera: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },
  superadmin: {
    roles: ["SUPER_ADMIN"],
  },
  soporte: {
    roles: ["OWNER", "CASHIER", "STOCKER", "DELIVERY", "SUPER_ADMIN"],
  },
  estado: {
    roles: ["OWNER", "SUPER_ADMIN"],
  },
  ayuda: {
    roles: ["OWNER", "CASHIER", "STOCKER", "DELIVERY", "SUPER_ADMIN"],
  },
  actividad: { roles: ["OWNER", "SUPER_ADMIN"] },
};
export function canAccessRole(
  role: string | undefined,
  section: Section
) {
  if (!role) return false;

  const permission = sectionPermissions[section];

  if (!permission) {
    console.warn(`Sección sin permisos configurados: ${section}`);
    return false;
  }

  return permission.roles.includes(role as Role);
}

export function getDefaultRouteByRole(role?: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/superadmin";
    case "OWNER":
      return "/dashboard";
    case "CASHIER":
      return "/ventas";
    case "DELIVERY":
      return "/motomandado";
    case "STOCKER":
      return "/productos";
    default:
      return "/login";
  }
}

export function getSectionFromPath(pathname: string): Section | null {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/productos")) return "productos";
  if (pathname.startsWith("/ventas")) return "ventas";
  if (pathname.startsWith("/clientes")) return "clientes";
  if (pathname.startsWith("/caja")) return "caja";
  if (pathname.startsWith("/empleados")) return "empleados";
  if (pathname.startsWith("/devoluciones")) return "devoluciones";
  if (pathname.startsWith("/reportes")) return "reportes";
  if (pathname.startsWith("/envios")) return "envios";
  if (pathname.startsWith("/motomandado")) return "motomandado";
  if (pathname.startsWith("/compras")) return "compras";
  if (pathname.startsWith("/cobros")) return "cobros";
  if (pathname.startsWith("/finanzas")) return "finanzas";
  if (pathname.startsWith("/vencimientos")) return "vencimientos";
  if (pathname.startsWith("/configuracion")) return "configuracion";
  if (pathname.startsWith("/onboarding")) return "onboarding";
  if (pathname.startsWith("/planes")) return "planes";
  if (pathname.startsWith("/papelera")) return "papelera";
  if (pathname.startsWith("/superadmin")) return "superadmin";
  if (pathname.startsWith("/soporte")) return "soporte";
  if (pathname.startsWith("/estado")) return "estado";
  if (pathname.startsWith("/ayuda")) return "ayuda";
  if (pathname.startsWith("/actividad")) return "actividad";
  if (pathname.startsWith("/promociones")) return "promociones";
  if (pathname.startsWith("/combos")) return "combos";
  if (pathname.startsWith("/proveedores")) return "proveedores";
  if (pathname.startsWith("/ordenes-compra")) return "ordenesCompra";
  
  return null;
}