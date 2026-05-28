"use client";

import { useState, useTransition } from "react";
import {
  importProducts,
  previewProductImport,
} from "@/actions/product-import.actions";
import { ProductImportError, ProductImportRow } from "@/lib/product-import";

export function ProductImportForm() {
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [validRows, setValidRows] = useState<ProductImportRow[]>([]);
  const [errors, setErrors] = useState<ProductImportError[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handlePreview(formData: FormData) {
    setMessage("");
    setError("");
    setRows([]);
    setValidRows([]);
    setErrors([]);

    startTransition(async () => {
      const result = await previewProductImport(formData);

      if (!result.success) {
        setError(result.error || "No se pudo leer el archivo.");
        return;
      }

      setRows(result.rows || []);
      setValidRows(result.validRows || []);
      setErrors(result.errors || []);

      setMessage(
        `Vista previa lista. ${result.validCount} productos válidos de ${result.totalCount}. ${
          result.skippedCount ? `${result.skippedCount} filas serán omitidas.` : ""
        }`
      );
    });
  }

  function handleImport() {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await importProducts(validRows);

      if (!result.success) {
        setError(result.error || "No se pudo importar.");
        return;
      }

      setMessage(result.message || "Productos importados correctamente.");
      setRows([]);
      setValidRows([]);
      setErrors([]);
    });
  }

  return (
    <div className="space-y-6">
      <form
        action={handlePreview}
        className="app-card-2xl grid gap-4 p-5 md:grid-cols-[1fr_auto_auto]"
      >
        <input
          name="file"
          type="file"
          accept=".xlsx,.csv"
          required
          className="app-input"
        />

        <a
          href="/api/productos/import-template"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold app-muted hover:bg-white/10"
        >
          Descargar plantilla
        </a>

        <button
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Procesando..." : "Previsualizar"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {validRows.length > 0 && (
        <button
          onClick={handleImport}
          disabled={isPending}
          className="min-h-12 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending
            ? "Importando..."
            : `Importar ${validRows.length} productos válidos`}
        </button>
      )}

      {errors.length > 0 && (
        <section className="app-card-2xl p-5">
          <h2 className="text-xl font-semibold text-amber-400">
            Filas omitidas / errores
          </h2>

          <p className="mt-2 app-muted">
            Estas filas no se importarán, pero el resto de productos válidos sí.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-white/[0.04] app-muted">
                <tr>
                  <th className="px-4 py-3">Fila</th>
                  <th className="px-4 py-3">Campo</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>

              <tbody>
                {errors.slice(0, 100).map((item, index) => (
                  <tr key={index} className="border-t border-white/10">
                    <td className="px-4 py-3">{item.rowNumber}</td>
                    <td className="px-4 py-3">{item.field}</td>
                    <td className="px-4 py-3 text-amber-300">
                      {item.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errors.length > 100 && (
            <p className="mt-4 text-sm app-muted">
              Se muestran los primeros 100 errores de {errors.length}.
            </p>
          )}
        </section>
      )}

      {rows.length > 0 && (
        <section className="app-card-2xl p-5">
          <div>
            <h2 className="text-xl font-semibold">Vista previa</h2>
            <p className="mt-1 app-muted">
              {validRows.length} productos válidos listos para importar.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-white/[0.04] app-muted">
                <tr>
                  <th className="px-4 py-3">Fila</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Costo</th>
                  <th className="px-4 py-3">Venta</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Mínimo</th>
                </tr>
              </thead>

              <tbody>
                {validRows.slice(0, 100).map((row) => (
                  <tr key={row.rowNumber} className="border-t border-white/10">
                    <td className="px-4 py-3">{row.rowNumber}</td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 app-muted">
                      {row.barcode || "-"}
                    </td>
                    <td className="px-4 py-3 app-muted">
                      {row.category || "-"}
                    </td>
                    <td className="px-4 py-3 app-muted">{row.brand || "-"}</td>
                    <td className="px-4 py-3 app-muted">
                      {row.supplierName || "-"}
                    </td>
                    <td className="px-4 py-3">${row.costPrice}</td>
                    <td className="px-4 py-3">${row.salePrice}</td>
                    <td className="px-4 py-3">{row.stock}</td>
                    <td className="px-4 py-3">{row.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validRows.length > 100 && (
            <p className="mt-4 text-sm app-muted">
              Se muestran los primeros 100 productos válidos de{" "}
              {validRows.length}.
            </p>
          )}
        </section>
      )}
    </div>
  );
}