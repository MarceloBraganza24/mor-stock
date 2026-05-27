import {
  cancelPurchase,
  createSupplier,
  deleteSupplier,
  getPurchases,
  getSuppliers,
} from "@/actions/purchase.actions";
import { getProducts } from "@/actions/product.actions";
import { PurchaseForm } from "@/components/PurchaseForm";
import { TableContainer } from "@/components/ui/TableContainer";
import { FeatureLocked } from "@/components/FeatureLocked";

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

const inputClass =
  "min-h-12 app-input text-base outline-none transition focus:border-emerald-500";

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

export default async function ComprasPage({ searchParams }: Props) {
  const params = await searchParams;

  const products = await getProducts();

  let suppliers = [];
  let purchases = [];

  try {
    suppliers = await getSuppliers();
    purchases = await getPurchases();
  } catch (error) {
    return (
      <FeatureLocked
        title="Compras bloqueado"
        description="Tu suscripción todavía no está activa. Cuando Mercado Pago confirme el pago, este módulo se habilitará automáticamente."
      />
    );
  }

  const totalPurchased = purchases
    .filter((purchase: any) => purchase.status === "COMPLETADA")
    .reduce((acc: number, purchase: any) => acc + purchase.total, 0);

  const exportUrl = `/api/reportes/compras?from=${params.from || ""}&to=${
    params.to || ""
  }`;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Mercadería y proveedores
        </p>
        <h1 className="mt-2 text-3xl font-bold">Compras</h1>
        <p className="mt-2 app-muted">
          Registrá mercadería comprada, proveedores, costos y stock entrante.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={exportUrl}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Exportar CSV
        </a>
      </div>

      <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={cardClass}>
          <p className="text-sm app-muted">Proveedores</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {suppliers.length}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Compras registradas</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {purchases.length}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Total comprado</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            ${totalPurchased}
          </h2>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h2 className="text-xl font-semibold">Proveedores</h2>

        <form
          action={createSupplier}
          className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <input
            name="name"
            placeholder="Nombre proveedor"
            required
            className={inputClass}
          />

          <input
            name="phone"
            placeholder="Teléfono"
            className={inputClass}
          />

          <input
            name="notes"
            placeholder="Notas"
            className={inputClass}
          />

          <button className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50">
            Crear proveedor
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier: any) => (
            <div
              key={supplier._id}
              className="rounded-2xl border border-white/10 bg-neutral-900 p-4"
            >
              <p className="font-medium">{supplier.name}</p>

              <p className="mt-1 text-sm app-muted">
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
                <button className="text-sm font-medium text-red-400 hover:text-red-300">
                  Eliminar
                </button>
              </form>
            </div>
          ))}

          {suppliers.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-white/40 md:col-span-2 xl:col-span-3">
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

        <TableContainer minWidth="1100px">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase: any) => (
                <tr
                  key={purchase._id}
                  className="border-t border-white/10 align-top"
                >
                  <td className="px-4 py-4 text-white/60">
                    {new Date(purchase.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-4">
                    {purchase.supplier?.name || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {purchase.items.map((item: any) => (
                        <div key={`${purchase._id}-${item.product}`}>
                          {item.quantity}x {item.name} · ${item.unitCost}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-white/70">
                    {purchase.paymentMethod}
                  </td>

                  <td className="px-4 py-4 text-white/70">
                    {purchase.user?.name || "-"}
                  </td>

                  <td className="px-4 py-4">
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

                  <td className="px-4 py-4 font-semibold">
                    ${purchase.total}
                  </td>

                  <td className="px-4 py-4">
                    {purchase.status === "COMPLETADA" && (
                      <form
                        action={async () => {
                          "use server";
                          await cancelPurchase(purchase._id);
                        }}
                      >
                        <button className="text-sm font-medium text-red-400 hover:text-red-300">
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
        </TableContainer>
      </section>
    </div>
  );
}