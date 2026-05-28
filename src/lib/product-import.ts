import * as XLSX from "xlsx";

export type ProductImportRow = {
  rowNumber: number;
  name: string;
  barcode: string;
  category: string;
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

function getValue(row: any, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }

  return "";
}

function toNumber(value: any) {
  if (value === "" || value === null || value === undefined) return 0;

  const normalized = String(value).replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : NaN;
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

    const name = String(
      getValue(row, ["nombre", "Nombre", "producto", "Producto", "name"])
    ).trim();

    const barcode = String(
      getValue(row, [
        "codigo",
        "Código",
        "codigo_barra",
        "Código de barras",
        "barcode",
      ])
    ).trim();

    const category = String(
      getValue(row, ["categoria", "Categoría", "category"])
    ).trim();

    const costPrice = toNumber(
      getValue(row, ["precio_costo", "Precio costo", "costo", "costPrice"])
    );

    const salePrice = toNumber(
      getValue(row, ["precio_venta", "Precio venta", "precio", "salePrice"])
    );

    const stock = toNumber(getValue(row, ["stock", "Stock"]));

    const minStock = toNumber(
      getValue(row, ["stock_minimo", "Stock mínimo", "minStock"])
    );

    if (!name) {
      errors.push({
        rowNumber,
        field: "nombre",
        message: "El nombre es obligatorio.",
      });
    }

    if (!salePrice || Number.isNaN(salePrice) || salePrice <= 0) {
      errors.push({
        rowNumber,
        field: "precio_venta",
        message: "El precio de venta debe ser mayor a 0.",
      });
    }

    if (Number.isNaN(costPrice)) {
      errors.push({
        rowNumber,
        field: "precio_costo",
        message: "El precio de costo no es válido.",
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