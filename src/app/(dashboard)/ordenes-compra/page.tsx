import {
  getPurchaseOrderData,
  updatePurchaseOrderStatus,
  receivePurchaseOrder
} from "@/actions/purchase-order.actions";
import { PurchaseOrderCreateForm } from "@/components/PurchaseOrderCreateForm";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    RECEIVED: "Recibida",
    CANCELLED: "Cancelada",
  };

  return labels[status] || status;
}

export default async function PurchaseOrdersPage() {
  const { suppliers, products, orders } =
    await getPurchaseOrderData();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Compras
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Órdenes de compra
        </h1>

        <p className="mt-2 app-muted">
          Creá pedidos a proveedores y controlá su estado.
        </p>
      </div>

      <PurchaseOrderCreateForm
        suppliers={suppliers}
        products={products}
      />

      <section className="app-card-2xl p-5">
        <h2 className="text-xl font-semibold">
          Órdenes registradas
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-white/[0.04] app-muted">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Total estimado</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order: any) => (
                <tr
                  key={order._id}
                  className="border-t border-white/10"
                >
                  <td className="px-4 py-3 app-muted">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {order.supplier?.name || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {getStatusLabel(order.status)}
                  </td>

                  <td className="px-4 py-3 app-muted">
                    {order.items.length} productos
                  </td>

                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    ${Number(order.totalEstimated || 0).toLocaleString("es-AR")}
                  </td>

                  <td className="px-4 py-3 app-muted">
                    {order.user?.name || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {order.status === "DRAFT" && (
                        <form
                          action={async () => {
                            "use server";
                            await updatePurchaseOrderStatus(
                              order._id,
                              "SENT"
                            );
                          }}
                        >
                          <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-neutral-950">
                            Marcar enviada
                          </button>
                        </form>
                      )}

                      {order.status !== "RECEIVED" && order.status !== "CANCELLED" && (
                        <form
                            action={async () => {
                            "use server";
                            await receivePurchaseOrder(order._id);
                            }}
                        >
                            <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-neutral-950">
                            Recibir mercadería
                            </button>
                        </form>
                        )}

                      {order.status !== "RECEIVED" &&
                        order.status !== "CANCELLED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updatePurchaseOrderStatus(
                                order._id,
                                "CANCELLED"
                              );
                            }}
                          >
                            <button className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                              Cancelar
                            </button>
                          </form>
                        )}
                    </div>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center app-muted"
                  >
                    Todavía no hay órdenes de compra.
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