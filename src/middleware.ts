import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  canAccessRole,
  getDefaultRouteByRole,
  getSectionFromPath,
} from "@/lib/permissions";

const protectedRoutes = [
  "/dashboard",
  "/productos",
  "/ventas",
  "/clientes",
  "/caja",
  "/empleados",
  "/devoluciones",
  "/reportes",
  "/envios",
  "/motomandado",
  "/compras",
  "/cobros",
  "/finanzas",
  "/vencimientos",
  "/configuracion",
  "/onboarding",
  "/planes",
  "/papelera",
  "/superadmin",
  "/comercio-suspendido",
  "/soporte",
  "/promociones",
  "/combos",
  "/proveedores",
  "/ordenes-compra",
];

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: authSecret,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isLoggedIn && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  const section = getSectionFromPath(pathname);

  if (section && !canAccessRole(role, section)) {
    return NextResponse.redirect(new URL("/sin-permiso", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/productos/:path*",
    "/ventas/:path*",
    "/clientes/:path*",
    "/caja/:path*",
    "/empleados/:path*",
    "/devoluciones/:path*",
    "/reportes/:path*",
    "/envios/:path*",
    "/motomandado/:path*",
    "/compras/:path*",
    "/cobros/:path*",
    "/finanzas/:path*",
    "/vencimientos/:path*",
    "/configuracion/:path*",
    "/onboarding/:path*",
    "/planes/:path*",
    "/papelera/:path*",
    "/superadmin/:path*",
    "/soporte/:path*",
    "/promociones/:path*",
    "/combos/:path*",
    "/proveedores/:path*",
    "/ordenes-compra/:path*",
    "/comercio-suspendido",
    "/login",
    "/register",
  ],
};