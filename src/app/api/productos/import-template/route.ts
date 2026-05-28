import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const rows = [
    {
      nombre: "Coca Cola 2.25L",
      codigo: "779000000001",
      categoria: "Bebidas",
      precio_costo: 1800,
      precio_venta: 2500,
      stock: 10,
      stock_minimo: 3,
    },
    {
      nombre: "Yerba Playadito 1kg",
      codigo: "779000000002",
      categoria: "Almacén",
      precio_costo: 2500,
      precio_venta: 3400,
      stock: 6,
      stock_minimo: 2,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla-productos.xlsx"',
    },
  });
}