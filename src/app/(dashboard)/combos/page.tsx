import {
  deleteCombo,
  getComboProducts,
  getCombos,
} from "@/actions/combo.actions";

import { ComboCreateForm } from "@/components/ComboCreateForm";

export default async function CombosPage() {
  const [combos, products] = await Promise.all([
    getCombos(),
    getComboProducts(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Ventas
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Combos
        </h1>

        <p className="mt-2 app-muted">
          Creá combos de múltiples productos.
        </p>
      </div>

      <ComboCreateForm products={products} />

      <section className="app-card-2xl p-5">
        <h2 className="text-xl font-semibold">
          Combos activos
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.04] app-muted">
              <tr>
                <th className="px-4 py-3">
                  Nombre
                </th>

                <th className="px-4 py-3">
                  Productos
                </th>

                <th className="px-4 py-3">
                  Precio
                </th>

                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {combos.map((combo: any) => (
                <tr
                  key={combo._id}
                  className="border-t border-white/10"
                >
                  <td className="px-4 py-3 font-medium">
                    {combo.name}
                  </td>

                  <td className="px-4 py-3 app-muted">
                    <div className="space-y-1">
                      {combo.items.map(
                        (item: any, index: number) => (
                          <p key={index}>
                            {item.quantity}x{" "}
                            {
                              item.product
                                ?.name
                            }
                          </p>
                        )
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    $
                    {combo.comboPrice.toLocaleString(
                      "es-AR"
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";

                        await deleteCombo(
                          combo._id
                        );
                      }}
                    >
                      <button className="text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {combos.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center app-muted"
                  >
                    Todavía no hay combos.
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