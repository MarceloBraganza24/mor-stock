export type Role =
  | "SUPER_ADMIN"
  | "OWNER"
  | "CASHIER"
  | "STOCKER"
  | "DELIVERY";

export const permissions = {
  dashboard: ["OWNER", "SUPER_ADMIN"],
  productos: ["OWNER", "SUPER_ADMIN", "STOCKER"],
  ventas: ["OWNER", "SUPER_ADMIN", "CASHIER"],
  clientes: ["OWNER", "SUPER_ADMIN", "CASHIER"],
  caja: ["OWNER", "SUPER_ADMIN", "CASHIER"],
  empleados: ["OWNER", "SUPER_ADMIN"],
  devoluciones: ["OWNER", "SUPER_ADMIN", "CASHIER"],
  reportes: ["OWNER", "SUPER_ADMIN"],
  envios: ["OWNER", "SUPER_ADMIN", "CASHIER"],
  motomandado: ["DELIVERY"],
  compras: ["OWNER", "SUPER_ADMIN", "STOCKER"],
  cobros: ["OWNER", "SUPER_ADMIN"],
};

export function canAccess(
  role: string | undefined,
  section: keyof typeof permissions
) {
  if (!role) return false;
  return permissions[section].includes(role as Role);
}

export function getDefaultRouteByRole(role: string | undefined) {
  if (role === "OWNER" || role === "SUPER_ADMIN") return "/dashboard";
  if (role === "CASHIER") return "/ventas";
  if (role === "STOCKER") return "/productos";
  if (role === "DELIVERY") return "/motomandado";

  return "/login";
}