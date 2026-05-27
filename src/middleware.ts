import { auth } from "@/auth";
import { NextResponse } from "next/server";
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
  "/sin-permiso",
  "/papelera",
  "/superadmin",
  "/comercio-suspendido",
  "/soporte",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

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
});

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
    "/comercio-suspendido",
    "/sin-permiso",
    "/login",
    "/register",
  ],
};