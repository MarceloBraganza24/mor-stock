import { NextRequest } from "next/server";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Purchase } from "@/models/Purchase";

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
    store: session.user.store,
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

  const purchases = await Purchase.find(query)
    .populate("supplier", "name")
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const rows = purchases.map((p: any) => [
    new Date(p.createdAt).toLocaleString("es-AR"),
    p.supplier?.name || "",
    p.paymentMethod,
    p.status,
    p.user?.name || "",
    p.total,
    p.items.map((i: any) => `${i.quantity}x ${i.name}`).join(" | "),
  ]);

  const content = [
    ["Fecha", "Proveedor", "Pago", "Estado", "Usuario", "Total", "Productos"]
      .map(csv)
      .join(","),
    ...rows.map((r) => r.map(csv).join(",")),
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="compras.csv"`,
    },
  });
}