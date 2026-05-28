import { ProductImportForm } from "@/components/ProductImportForm";

export default function ImportarProductosPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Productos</p>

        <h1 className="mt-2 text-3xl font-bold">Importar productos</h1>

        <p className="mt-2 app-muted">
          Subí un archivo Excel o CSV para cargar productos de forma masiva.
        </p>
      </div>

      <ProductImportForm />
    </div>
  );
}