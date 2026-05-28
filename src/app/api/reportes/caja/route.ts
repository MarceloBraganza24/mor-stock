import { NextRequest } from "next/server";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { CashMovement } from "@/models/CashMovement";

function csv(value: any) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = {
    store: session.user.store!,
  };

  if (from || to) {
    query.createdAt = {};

    if (from) {
      const d = new Date(from);
      d.setHours(0, 0, 0, 0);
      query.createdAt.$gte = d;
    }

    if (to) {
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      query.createdAt.$lte = d;
    }
  }

  const movements = await CashMovement.find(query)
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const rows = movements.map((m: any) => [
    new Date(m.createdAt).toLocaleString("es-AR"),
    m.type,
    m.source,
    m.amount,
    m.user?.name || "",
    m.description || "",
  ]);

  const content = [
    ["Fecha", "Tipo", "Origen", "Monto", "Usuario", "Descripcion"]
      .map(csv)
      .join(","),
    ...rows.map((r) => r.map(csv).join(",")),
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="caja.csv"`,
    },
  });
}