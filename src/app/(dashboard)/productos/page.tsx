import {
  deleteProduct,
  getProducts,
  updateProduct,
  adjustProductStock,
  getStockMovements
} from "@/actions/product.actions";
import { ProductCreateForm } from "@/components/ProductCreateForm";
import NextLink from "next/link";
import { BulkPriceUpdateForm } from "@/components/BulkPriceUpdateForm";
import { BulkIncreaseSupplierForm } from "@/components/BulkIncreaseSupplierForm";
import {
  getSuppliers,
} from "@/actions/purchase.actions";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    query?: string;
    category?: string;
    brand?: string;
    lowStock?: string;
    from?: string;
    page?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Productos | MorStock",
};

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page || 1);

  const productsData = await getProducts({
    query: params.query,
    brand: params.brand,
    category: params.category,
    lowStock: params.lowStock,
    page,
    limit: 50,
  });

  const products = productsData.products;

  const categories: string[] = Array.from(
    new Set(
      products
        .map((product: any) => String(product.category || ""))
        .filter(Boolean)
    )
  );

  const brands: string[] = Array.from(
    new Set(
      products
        .map((product: any) => String(product.brand || ""))
        .filter(Boolean)
    )
  );

  //const categories = await getProductCategories();
  const stockMovements = await getStockMovements();

  let suppliers: any[] = [];

  try {
    suppliers = await getSuppliers();
  } catch {
    suppliers = [];
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Stock</p>
        <h1 className="mt-2 text-3xl font-bold">Productos</h1>
        <p className="mt-2 app-muted">
          Buscá, filtrá, cargá y editá productos del comercio.
        </p>
      </div>
      
      <div className="mb-8 flex flex-wrap gap-3">
        <NextLink
          href="/productos/importar"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Importar Excel/CSV
        </NextLink>

        <NextLink
          href="/productos/etiquetas"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Imprimir precios
        </NextLink>
      </div>

      <BulkPriceUpdateForm categories={categories} brands={brands} />
      <BulkIncreaseSupplierForm
        suppliers={JSON.parse(JSON.stringify(suppliers))}
      />

      {params.query && (
        <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-300">
            Código detectado desde el scanner:
          </p>
          <p className="mt-1 text-xl font-bold">{params.query}</p>
        </div>
      )}

      <ProductCreateForm
        defaultBarcode={params.query || ""}
        redirectTo={params.from === "ventas" ? "/ventas" : ""}
      />

      <div id="resultados" className="scroll-mt-24" />

      <form
        action="/productos#resultados"
        className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4"
      >

        <input type="hidden" name="page" value="1" />

        <div className="md:col-span-2 xl:col-span-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Buscar producto
          </h2>
        </div>

        <input
          name="query"
          defaultValue={params.query || ""}
          placeholder="Buscar nombre o código"
          className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
        />

        <select
          name="category"
          defaultValue={params.category || "TODAS"}
          className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
        >
          <option value="TODAS">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          name="brand"
          defaultValue={params.brand || "TODAS"}
          className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
        >
          <option value="TODAS">Todas las marcas</option>

          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          name="lowStock"
          defaultValue={params.lowStock || "false"}
          className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
        >
          <option value="false">Todos los stocks</option>
          <option value="true">Solo stock bajo</option>
        </select>

        <button className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50">
          Filtrar
        </button>
      </form>

      <div id="resultados" className="scroll-mt-6" />

      <div className="mb-4">
        <p className="mb-4 text-sm text-white/50">
          Resultados encontrados:{" "}
          <strong className="text-white">{productsData.total}</strong>
          {" "}— página{" "}
          <strong className="text-white">{productsData.page}</strong>
          {" "}de{" "}
          <strong className="text-white">{productsData.totalPages || 1}</strong>
        </p>
      </div>

      <div className="max-h-[800px] overflow-y-auto pr-2 hide-scrollbar">
        {products.map((product: any) => {
          const lowStock = product.stock <= product.minStock;

          return (
            <div
              key={product._id}
              className="app-card-2xl p-5 mb-6"
            >
              <form
                action={async (formData) => {
                  "use server";
                  await updateProduct(product._id, formData);
                }}
                className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                    Producto
                  </label>
                  <input
                    name="name"
                    defaultValue={product.name}
                    placeholder="Nombre del producto"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Código / Barcode</label>
                  <input
                    name="barcode"
                    defaultValue={product.barcode}
                    placeholder="Código"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Categoría</label>
                  <input
                    name="category"
                    defaultValue={product.category}
                    placeholder="Categoría"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">
                    Marca
                  </label>
                  <input
                    name="brand"
                    defaultValue={product.brand}
                    placeholder="Marca"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Precio costo</label>
                  <input
                    name="costPrice"
                    type="number"
                    defaultValue={product.costPrice}
                    placeholder="Precio costo"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Precio venta</label>
                  <input
                    name="salePrice"
                    type="number"
                    defaultValue={product.salePrice}
                    placeholder="Precio venta"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Stock actual</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={product.stock}
                    placeholder="Stock actual"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/45">Stock mínimo</label>
                  <input
                    name="minStock"
                    type="number"
                    defaultValue={product.minStock}
                    placeholder="Stock mínimo"
                    className="min-h-12 w-full app-input text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="xl:col-span-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  {lowStock ? (
                    <span className="rounded-full bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      Stock bajo
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                      Stock OK
                    </span>
                  )}

                  <button className="min-h-12 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50">
                    Guardar cambios
                  </button>
                </div>
              </form>

              <form
                  action={adjustProductStock}
                  className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-5"
                >
                  <input type="hidden" name="productId" value={product._id} />

                  <select
                    name="type"
                    className="min-h-12 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
                  >
                    <option value="SUMA">Sumar stock</option>
                    <option value="RESTA">Restar stock</option>
                    <option value="AJUSTE">Ajustar stock exacto</option>
                  </select>

                  <input
                    name="quantity"
                    type="number"
                    placeholder="Cantidad"
                    required
                    className="min-h-12 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
                  />

                  <input
                    name="reason"
                    placeholder="Motivo"
                    className="min-h-12 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
                  />

                  <button className="min-h-12 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20">
                    Aplicar ajuste
                  </button>
                </form>

              <form
                action={async () => {
                  "use server";
                  await deleteProduct(product._id);
                }}
                className="mt-3"
              >
                <button className="text-sm text-red-400 hover:text-red-300">
                  Eliminar producto
                </button>
              </form>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
            No se encontraron productos con esos filtros.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {productsData.page > 1 ? (
          <NextLink
            href={{
              pathname: "/productos",
              query: {
                ...params,
                page: productsData.page - 1,
              },
              hash: "resultados",
            }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            ← Anterior
          </NextLink>
        ) : (
          <div />
        )}

        {productsData.page < productsData.totalPages && (
          <NextLink
            href={{
              pathname: "/productos",
              query: {
                ...params,
                page: productsData.page + 1,
              },
              hash: "resultados",
            }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Siguiente →
          </NextLink>
        )}
      </div>
      
      <div className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Auditoría de stock
          </p>
          <h2 className="mt-2 text-2xl font-bold">Movimientos de stock</h2>
          <p className="mt-2 app-muted">
            Historial de reposiciones, ajustes y correcciones.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Anterior</th>
                <th className="px-4 py-3">Nuevo</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>

            <tbody>
              {stockMovements.map((movement: any) => (
                <tr key={movement._id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/60">
                    {new Date(movement.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{movement.product?.name || "-"}</p>
                    <p className="text-xs text-white/40">
                      {movement.product?.barcode || "Sin código"}
                    </p>
                  </td>

                  <td
                    className={`px-4 py-3 font-medium ${
                      movement.type === "RESTA"
                        ? "text-red-400"
                        : movement.type === "SUMA"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {movement.type}
                  </td>

                  <td className="px-4 py-3">{movement.quantity}</td>
                  <td className="px-4 py-3 text-white/60">
                    {movement.previousStock}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {movement.newStock}
                  </td>

                  <td className="px-4 py-3 text-white/70">
                    {movement.user?.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {movement.reason || "-"}
                  </td>
                </tr>
              ))}

              {stockMovements.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no hay movimientos de stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}