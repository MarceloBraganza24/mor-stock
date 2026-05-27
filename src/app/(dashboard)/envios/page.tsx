import {
  cancelDeliveryOrder,
  createDeliveryOrder,
  getStoreDeliveryOrders,
} from "@/actions/delivery.actions";
import { DeliveryCreateForm } from "@/components/DeliveryCreateForm";

export default async function EnviosPage() {
  const orders = await getStoreDeliveryOrders();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Motomandado</p>
        <h1 className="mt-2 text-3xl font-bold">Envíos a domicilio</h1>
        <p className="mt-2 app-muted">
          Solicitá motomandado y controlá el estado de cada entrega.
        </p>
      </div>

      <DeliveryCreateForm />

      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div
            key={order._id}
            className="app-card-2xl p-5"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm text-white/40">
                  {new Date(order.createdAt).toLocaleString("es-AR")}
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {order.customerName}
                </h2>

                <p className="mt-1 text-white/60">{order.address}</p>
                <p className="mt-1 text-white/60">{order.customerPhone}</p>

                {order.notes && (
                  <p className="mt-2 text-sm text-white/40">{order.notes}</p>
                )}
              </div>

              <div className="text-left md:text-right">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  {order.status}
                </span>

                <p className="mt-3 text-sm app-muted">Motomandado</p>
                <p className="font-medium">
                  {order.deliveryUser?.name || "Sin tomar"}
                </p>

                <p className="mt-3 text-sm app-muted">Costo envío</p>
                <p className="font-semibold">${order.deliveryFee}</p>
              </div>
            </div>

            {order.status !== "ENTREGADO" && order.status !== "CANCELADO" && (
              <form
                action={async () => {
                  "use server";
                  await cancelDeliveryOrder(order._id);
                }}
                className="mt-4"
              >
                <button className="text-sm text-red-400 hover:text-red-300">
                  Cancelar envío
                </button>
              </form>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
            Todavía no hay envíos cargados.
          </div>
        )}
      </div>
    </div>
  );
}