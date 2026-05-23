import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { canAccess, getDefaultRouteByRole } from "@/lib/permissions";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  const protectedRoutes = [
    "/dashboard",
    "/productos",
    "/ventas",
    "/clientes",
    "/caja",
    "/empleados",
    "/devoluciones",
    "/reportes",
  ];

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

  if (pathname.startsWith("/dashboard") && !canAccess(role, "dashboard")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/productos") && !canAccess(role, "productos")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/ventas") && !canAccess(role, "ventas")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/clientes") && !canAccess(role, "clientes")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/caja") && !canAccess(role, "caja")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/empleados") && !canAccess(role, "empleados")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/devoluciones") && !canAccess(role, "devoluciones")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
  }

  if (pathname.startsWith("/reportes") && !canAccess(role, "reportes")) {
    return NextResponse.redirect(
      new URL(getDefaultRouteByRole(role), req.nextUrl.origin)
    );
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
    "/login",
    "/register",
    "/devoluciones/:path*",
    "/reportes/:path*",
  ],
};