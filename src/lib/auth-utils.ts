import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireRoles(roles: string[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const store = session.user.store!;

  if (!role) {
    redirect("/login");
  }

  if (!roles.includes(role)) {
    redirect("/sin-permiso");
  }

  if (!store && role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return {
    ...session,
    user: {
      ...session.user,
      role,
      store,
    },
  };
}