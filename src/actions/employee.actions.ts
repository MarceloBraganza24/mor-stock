"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { employeeSchema } from "@/lib/validations";
import { User } from "@/models/User";
import { assertCanCreateEmployee } from "@/lib/plan-utils";
import { getActionError } from "@/lib/action-response";
import { createAuditLog } from "@/lib/audit";

export async function getEmployees() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const employees = await User.find({
    store: session.user.store!,
    role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    isActive: true,
  }).sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(employees));
}

export async function createEmployee(formData: FormData) {
  try {
    const session = await requireRoles(["OWNER"]);

    const parsed = employeeSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    });

    await connectDB();

    await assertCanCreateEmployee(session.user.store);

    const existingUser = await User.findOne({
      email: parsed.email.toLowerCase(),
    });

    if (existingUser) {
      return {
        success: false,
        error: "Ya existe un usuario con ese email",
      };
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const employee = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      password: hashedPassword,
      role: parsed.role,
      store: session.user.store!,
      isActive: true,
    });

    await createAuditLog({
      store: session.user.store!,
      user: session.user.id,
      action: "CREATE_EMPLOYEE",
      entity: "User",
      entityId: employee._id.toString(),
      description: `Creó empleado ${employee.name}`,
      metadata: {
        role: parsed.role,
        email: parsed.email,
      },
    });

    revalidatePath("/empleados");

    return {
      success: true,
      message: "Empleado creado correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: getActionError(error),
    };
  }
}

export async function deleteEmployee(employeeId: string) {
  const session = await requireRoles(["OWNER"]);

  if (!employeeId) {
    throw new Error("Empleado inválido");
  }

  await connectDB();

  await User.findOneAndUpdate(
    {
      _id: employeeId,
      store: session.user.store!,
      role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    },
    {
      isActive: false,
    }
  );

  await createAuditLog({
    store: session.user.store!,
    user: session.user.id,
    action: "DELETE_EMPLOYEE",
    entity: "User",
    entityId: employeeId,
    description: "Desactivó empleado",
  });

  revalidatePath("/empleados");
}