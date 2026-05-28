import * as XLSX from "xlsx";

export type ProductImportRow = {
  rowNumber: number;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  supplierName: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
};

export type ProductImportError = {
  rowNumber: number;
  field: string;
  message: string;
};

const columnAliases = {
  name: [
    "nombre",
    "producto",
    "descripcion",
    "descripción",
    "detalle",
    "articulo",
    "artículo",
    "item",
    "name",
  ],
  barcode: [
    "codigo",
    "código",
    "cod",
    "cod barra",
    "cod barras",
    "codigo barra",
    "codigo barras",
    "codigo de barras",
    "código de barras",
    "barcode",
    "ean",
  ],
  category: [
    "categoria",
    "categoría",
    "rubro",
    "familia",
    "grupo",
    "linea",
    "línea",
    "category",
  ],
  brand: ["marca", "brand", "fabricante"],
  supplierName: [
    "proveedor",
    "supplier",
    "distribuidor",
    "mayorista",
  ],
  costPrice: [
    "precio_costo",
    "precio costo",
    "costo",
    "precio compra",
    "p compra",
    "pcosto",
    "costprice",
  ],
  salePrice: [
    "precio_venta",
    "precio venta",
    "precio",
    "precio final",
    "p venta",
    "pventa",
    "publico",
    "público",
    "venta",
    "saleprice",
  ],
  stock: [
    "stock",
    "existencia",
    "existencias",
    "cantidad",
    "cant",
    "unidades",
  ],
  minStock: [
    "stock_minimo",
    "stock mínimo",
    "stock minimo",
    "minimo",
    "mínimo",
    "minstock",
  ],
};

function normalizeKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getValue(row: any, field: keyof typeof columnAliases) {
  const normalizedRow: Record<string, any> = {};

  Object.keys(row).forEach((key) => {
    normalizedRow[normalizeKey(key)] = row[key];
  });

  for (const alias of columnAliases[field]) {
    const normalizedAlias = normalizeKey(alias);

    if (
      normalizedRow[normalizedAlias] !== undefined &&
      normalizedRow[normalizedAlias] !== null
    ) {
      return normalizedRow[normalizedAlias];
    }
  }

  return "";
}

function toNumber(value: any) {
  if (value === "" || value === null || value === undefined) return 0;

  let raw = String(value)
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .trim();

  if (raw.includes(",") && raw.includes(".")) {
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else if (raw.includes(",") && !raw.includes(".")) {
    raw = raw.replace(",", ".");
  }

  const number = Number(raw);

  return Number.isFinite(number) ? number : NaN;
}

function isEmptyRow(row: any) {
  return Object.values(row).every(
    (value) => value === "" || value === null || value === undefined
  );
}

export async function parseProductImportFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 0,
          field: "archivo",
          message: "El archivo no tiene hojas válidas.",
        },
      ],
    };
  }

  const sheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<any>(sheet, {
    defval: "",
  });

  const rows: ProductImportRow[] = [];
  const errors: ProductImportError[] = [];
  const seenBarcodes = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;

    if (isEmptyRow(row)) return;

    const name = String(getValue(row, "name")).trim();
    const barcode = String(getValue(row, "barcode")).trim();
    const category = String(getValue(row, "category")).trim();
    const brand = String(getValue(row, "brand")).trim();
    const supplierName = String(getValue(row, "supplierName")).trim();

    const costPrice = toNumber(getValue(row, "costPrice"));
    const salePrice = toNumber(getValue(row, "salePrice"));
    const stock = toNumber(getValue(row, "stock"));
    const minStock = toNumber(getValue(row, "minStock"));

    if (!name) {
      errors.push({
        rowNumber,
        field: "nombre",
        message: "El nombre es obligatorio.",
      });
    }

    if (Number.isNaN(costPrice)) {
      errors.push({
        rowNumber,
        field: "precio_costo",
        message: "El precio de costo no es válido.",
      });
    }

    if (Number.isNaN(salePrice)) {
      errors.push({
        rowNumber,
        field: "precio_venta",
        message: "El precio de venta no es válido.",
      });
    }

    if (Number.isNaN(stock)) {
      errors.push({
        rowNumber,
        field: "stock",
        message: "El stock no es válido.",
      });
    }

    if (Number.isNaN(minStock)) {
      errors.push({
        rowNumber,
        field: "stock_minimo",
        message: "El stock mínimo no es válido.",
      });
    }

    if (barcode) {
      if (seenBarcodes.has(barcode)) {
        errors.push({
          rowNumber,
          field: "codigo",
          message: "Código repetido dentro del archivo.",
        });
      }

      seenBarcodes.add(barcode);
    }

    rows.push({
      rowNumber,
      name,
      barcode,
      category,
      brand,
      supplierName,
      costPrice: Number.isNaN(costPrice) ? 0 : costPrice,
      salePrice: Number.isNaN(salePrice) ? 0 : salePrice,
      stock: Number.isNaN(stock) ? 0 : stock,
      minStock: Number.isNaN(minStock) ? 0 : minStock,
    });
  });

  return {
    rows,
    errors,
  };
}