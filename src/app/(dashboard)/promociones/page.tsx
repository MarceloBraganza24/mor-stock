import {
  deletePromotion,
  getPromotionProducts,
  getPromotions,
} from "@/actions/promotion.actions";
import { PromotionCreateForm } from "@/components/PromotionCreateForm";

export default async function PromocionesPage() {
  const [promotions, products] = await Promise.all([
    getPromotions(),
    getPromotionProducts(),
  ]);

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

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Ventas</p>
        <h1 className="mt-2 text-3xl font-bold">Promociones</h1>
        <p className="mt-2 app-muted">
          Gestioná descuentos, combos simples y promociones comerciales.
        </p>
      </div>

      <PromotionCreateForm
        products={products}
        categories={categories}
        brands={brands}
      />

      <section className="app-card-2xl p-5">
        <h2 className="text-xl font-semibold">Promociones activas</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.04] app-muted">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Aplica a</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {promotions.map((promotion: any) => (
                <tr key={promotion._id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{promotion.name}</td>

                  <td className="px-4 py-3 app-muted">{promotion.type}</td>

                  <td className="px-4 py-3 app-muted">
                    {promotion.product?.name ||
                      promotion.category ||
                      promotion.brand ||
                      "-"}
                  </td>

                  <td className="px-4 py-3 app-muted">
                    {promotion.type === "PERCENTAGE" &&
                      `${promotion.percentage}%`}
                    {promotion.type === "FIXED_PRICE" &&
                      `$${promotion.fixedPrice}`}
                    {promotion.type === "BUY_X_PAY_Y" &&
                      `${promotion.buyQuantity}x${promotion.payQuantity}`}
                  </td>

                  <td className="px-4 py-3 app-muted">
                    {promotion.startsAt
                      ? new Date(promotion.startsAt).toLocaleDateString("es-AR")
                      : "Sin inicio"}{" "}
                    -{" "}
                    {promotion.endsAt
                      ? new Date(promotion.endsAt).toLocaleDateString("es-AR")
                      : "Sin fin"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deletePromotion(promotion._id);
                      }}
                    >
                      <button className="text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {promotions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center app-muted"
                  >
                    Todavía no hay promociones activas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}