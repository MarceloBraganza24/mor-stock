import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    store?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      store?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    store?: string | null;
  }
}