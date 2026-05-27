import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.store || !session.user.role) {
    throw new Error("No autorizado");
  }

  await connectDB();

  if (session.user.role !== "SUPER_ADMIN") {
    const store = await Store.findById(session.user.store).select("isActive");

    if (!store || !store.isActive) {
      throw new Error("El comercio está suspendido.");
    }
  }

  return session;
}

export async function requireRoles(roles: string[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    throw new Error("No tenés permisos para realizar esta acción");
  }

  return session;
}