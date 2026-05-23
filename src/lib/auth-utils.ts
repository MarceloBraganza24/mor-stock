import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.store || !session.user.role) {
    throw new Error("No autorizado");
  }

  return session;
}

export async function requireRoles(roles: string[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role || "")) {
    throw new Error("No tenés permisos para realizar esta acción");
  }

  return session;
}