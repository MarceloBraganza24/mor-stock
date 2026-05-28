import { getProducts } from "@/actions/product.actions";
import { ProductLabelsPrint } from "@/components/ProductLabelsPrint";

type Props = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
  }>;
};

export default async function ProductLabelsPage({ searchParams }: Props) {
  const params = await searchParams;

  const products = await getProducts();

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

  const filteredProducts = products.filter((product: any) => {
    const matchCategory =
      !params.category || product.category === params.category;

    const matchBrand = !params.brand || product.brand === params.brand;

    return matchCategory && matchBrand;
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Productos</p>

        <h1 className="mt-2 text-3xl font-bold">Etiquetas de precios</h1>

        <p className="mt-2 app-muted">
          Imprimí precios por categoría o marca para colocar en góndola.
        </p>
      </div>

      <ProductLabelsPrint
        products={JSON.parse(JSON.stringify(filteredProducts))}
        categories={categories}
        brands={brands}
        selectedCategory={params.category || ""}
        selectedBrand={params.brand || ""}
      />
    </div>
  );
}