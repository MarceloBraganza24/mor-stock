"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Store } from "@/models/Store";
import { createSlug } from "@/lib/slug";
import { signIn, signOut } from "@/auth";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  storeName: string;
  city?: string;
};

export async function registerOwner(data: RegisterInput) {
  await connectDB();

  const name = data.name.trim();
  const email = data.email.toLowerCase().trim();
  const password = data.password;
  const storeName = data.storeName.trim();
  const city = data.city?.trim() || "";

  if (!name || !email || !password || !storeName) {
    return { error: "Completá todos los campos obligatorios." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return { error: "Ya existe un usuario con ese email." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "OWNER",
  });

  let baseSlug = createSlug(storeName);
  let slug = baseSlug;
  let counter = 1;

  while (await Store.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const store = await Store.create({
    name: storeName,
    slug,
    owner: user._id,
    city,
    plan: "FREE",
  });

  user.store = store._id;
  await user.save();

  redirect("/login");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export async function logoutUser() {
  await signOut({
    redirectTo: "/login",
  });
}