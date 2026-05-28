"use client";

import { useRouter } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  barcode?: string;
  category?: string;
  brand?: string;
  salePrice: number;
};

export function ProductLabelsPrint({
  products,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
}: {
  products: Product[];
  categories: string[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
}) {
  const router = useRouter();

  function updateFilters(category: string, brand: string) {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);

    router.push(`/productos/etiquetas?${params.toString()}`);
  }

  return (
    <div>
      <section className="no-print app-card-2xl mb-8 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={selectedCategory}
            onChange={(e) => updateFilters(e.target.value, selectedBrand)}
            className="app-input"
          >
            <option value="">Todas las categorías</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => updateFilters(selectedCategory, e.target.value)}
            className="app-input"
          >
            <option value="">Todas las marcas</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Imprimir etiquetas
          </button>

          <p className="flex items-center text-sm app-muted">
            {products.length} productos listos
          </p>
        </div>
      </section>

      <section className="labels-grid">
        {products.map((product) => (
          <article key={product._id} className="price-label">
            <p className="label-brand">{product.brand || product.category}</p>

            <h2>{product.name}</h2>

            <p className="label-price">
              ${Number(product.salePrice || 0).toLocaleString("es-AR")}
            </p>

            {product.barcode && <p className="label-code">{product.barcode}</p>}
          </article>
        ))}
      </section>

      {products.length === 0 && (
        <p className="no-print app-muted">
          No hay productos para imprimir con esos filtros.
        </p>
      )}
    </div>
  );
}