import {
  cancelPurchase,
  createSupplier,
  deleteSupplier,
  getPurchases,
  getSuppliers,
} from "@/actions/purchase.actions";
import { getProducts } from "@/actions/product.actions";
import { PurchaseForm } from "@/components/PurchaseForm";

export default async function ComprasPage() {
  const products = await getProducts();
  const suppliers = await getSuppliers();
  const purchases = await getPurchases();

  const totalPurchased = purchases
    .filter((purchase: any) => purchase.status === "COMPLETADA")
    .reduce((acc: number, purchase: any) => acc + purchase.total, 0);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Mercadería y proveedores
        </p>
        <h1 className="mt-2 text-3xl font-bold">Compras</h1>
        <p className="mt-2 text-white/50">
          Registrá mercadería comprada, proveedores, costos y stock entrante.
        </p>
      </div>

      <a
        href={`/api/reportes/compras?from=${params.from || ""}&to=${params.to || ""}`}
        className="inline-flex rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20"
      >
        Exportar CSV
      </a>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Proveedores</p>
          <h2 className="mt-3 text-2xl font-bold">{suppliers.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Compras registradas</p>
          <h2 className="mt-3 text-2xl font-bold">{purchases.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Total comprado</p>
          <h2 className="mt-3 text-2xl font-bold">${totalPurchased}</h2>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-semibold">Proveedores</h2>

        <form
          action={createSupplier}
          className="mt-4 grid gap-4 md:grid-cols-4"
        >
          <input
            name="name"
            placeholder="Nombre proveedor"
            required
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="phone"
            placeholder="Teléfono"
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="notes"
            placeholder="Notas"
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
            Crear proveedor
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {suppliers.map((supplier: any) => (
            <div
              key={supplier._id}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4"
            >
              <p className="font-medium">{supplier.name}</p>
              <p className="mt-1 text-sm text-white/50">
                {supplier.phone || "Sin teléfono"}
              </p>

              {supplier.notes && (
                <p className="mt-1 text-sm text-white/40">{supplier.notes}</p>
              )}

              <form
                action={async () => {
                  "use server";
                  await deleteSupplier(supplier._id);
                }}
                className="mt-3"
              >
                <button className="text-sm text-red-400 hover:text-red-300">
                  Eliminar
                </button>
              </form>
            </div>
          ))}

          {suppliers.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40 md:col-span-3">
              Todavía no cargaste proveedores.
            </p>
          )}
        </div>
      </section>

      <PurchaseForm products={products} suppliers={suppliers} />

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Historial de compras
          </p>
          <h2 className="mt-2 text-2xl font-bold">Compras registradas</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase: any) => (
                <tr key={purchase._id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/60">
                    {new Date(purchase.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3">
                    {purchase.supplier?.name || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {purchase.items.map((item: any) => (
                      <div key={`${purchase._id}-${item.product}`}>
                        {item.quantity}x {item.name} · ${item.unitCost}
                      </div>
                    ))}
                  </td>

                  <td className="px-4 py-3 text-white/70">
                    {purchase.paymentMethod}
                  </td>

                  <td className="px-4 py-3 text-white/70">
                    {purchase.user?.name || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        purchase.status === "CANCELADA"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    ${purchase.total}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {purchase.status === "COMPLETADA" && (
                      <form
                        action={async () => {
                          "use server";
                          await cancelPurchase(purchase._id);
                        }}
                      >
                        <button className="text-sm text-red-400 hover:text-red-300">
                          Cancelar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}

              {purchases.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no hay compras registradas.
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