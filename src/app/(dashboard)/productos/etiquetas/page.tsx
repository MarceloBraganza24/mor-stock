import {
  getProducts,
  getProductsForLabels,
} from "@/actions/product.actions";
import { ProductLabelsPrint } from "@/components/ProductLabelsPrint";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etiquetas | MorStock",
};

type Props = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    limit?: string;
  }>;
};

export default async function ProductLabelsPage({ searchParams }: Props) {
  const params = await searchParams;

  const selectedCategory = params.category || "TODAS";
  const selectedBrand = params.brand || "TODAS";
  const selectedLimit = params.limit || "50";

  const products = await getProductsForLabels({
    category: selectedCategory,
    brand: selectedBrand,
    limit: selectedLimit,
  });

  const productsDataForFilters = await getProducts({
    page: 1,
    limit: 100,
  });

  const filterProducts = productsDataForFilters.products;

  const categories: string[] = Array.from(
    new Set(
      filterProducts
        .map((product: any) => String(product.category || ""))
        .filter(Boolean)
    )
  );

  const brands: string[] = Array.from(
    new Set(
      filterProducts
        .map((product: any) => String(product.brand || ""))
        .filter(Boolean)
    )
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Productos
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Etiquetas de precios
        </h1>

        <p className="mt-2 app-muted">
          Imprimí precios por categoría o marca para colocar en góndola.
        </p>
      </div>

      <ProductLabelsPrint
        products={JSON.parse(JSON.stringify(products))}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedLimit={selectedLimit}
      />
    </div>
  );
}