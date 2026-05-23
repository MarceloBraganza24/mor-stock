"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import { requireRoles } from "@/lib/auth-utils";
import { employeeSchema } from "@/lib/validations";
import { User } from "@/models/User";

export async function getEmployees() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const employees = await User.find({
    store: session.user.store,
    role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    isActive: true,
  }).sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(employees));
}

export async function createEmployee(formData: FormData) {
  const session = await requireRoles(["OWNER"]);

  const parsed = employeeSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  await connectDB();

  const existingUser = await User.findOne({
    email: parsed.email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Ya existe un usuario con ese email");
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 10);

  await User.create({
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    password: hashedPassword,
    role: parsed.role,
    store: session.user.store,
    isActive: true,
  });

  revalidatePath("/empleados");
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
      store: session.user.store,
      role: { $in: ["CASHIER", "STOCKER", "DELIVERY"] },
    },
    {
      isActive: false,
    }
  );

  revalidatePath("/empleados");
}