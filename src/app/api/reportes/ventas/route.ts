import { NextRequest } from "next/server";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Sale } from "@/models/Sale";

function escapeCSV(value: any) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = {
    store: session.user.store!,
    status: "COMPLETADA",
  };

  if (from || to) {
    query.createdAt = {};

    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = fromDate;
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  const sales = await Sale.find(query)
    .populate("customer", "name")
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  const headers = [
    "Fecha",
    "Total",
    "Ganancia",
    "Metodo de pago",
    "Cliente",
    "Usuario",
    "Productos",
  ];

  const rows = sales.map((sale: any) => {
    const products = sale.items
      .map((item: any) => `${item.quantity}x ${item.name}`)
      .join(" | ");

    return [
      new Date(sale.createdAt).toLocaleString("es-AR"),
      sale.total,
      sale.profit,
      sale.paymentMethod,
      sale.customer?.name || "",
      sale.user?.name || "",
      products,
    ];
  });

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reporte-ventas.csv"`,
    },
  });
}