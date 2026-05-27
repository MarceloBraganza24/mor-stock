import {
  getAvailableDeliveryOrders,
  takeDeliveryOrder,
  updateDeliveryStatus,
} from "@/actions/delivery.actions";

export default async function MotomandadoPage() {
  const orders = await getAvailableDeliveryOrders();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Panel mobile</p>
        <h1 className="mt-2 text-3xl font-bold">Motomandado</h1>
        <p className="mt-2 app-muted">
          Tomá pedidos y actualizá el estado de las entregas.
        </p>
      </div>

      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div
            key={order._id}
            className="app-card-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-emerald-400">
                  {order.store?.name || "Comercio"}
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {order.customerName}
                </h2>

                <p className="mt-2 text-white/70">{order.address}</p>
                <p className="mt-1 app-muted">{order.customerPhone}</p>

                {order.notes && (
                  <p className="mt-3 rounded-xl bg-neutral-900 p-3 text-sm text-white/60">
                    {order.notes}
                  </p>
                )}
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                {order.status}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-neutral-900 p-4">
              <p className="text-sm app-muted">Costo envío</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${order.deliveryFee}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {order.status === "PENDIENTE" && (
                <form
                  action={async () => {
                    "use server";
                    await takeDeliveryOrder(order._id);
                  }}
                >
                  <button className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
                    Tomar pedido
                  </button>
                </form>
              )}

              {order.status === "TOMADO" && (
                <form
                  action={async () => {
                    "use server";
                    await updateDeliveryStatus(order._id, "EN_CAMINO");
                  }}
                >
                  <button className="w-full rounded-xl bg-white/10 py-3 font-semibold text-white hover:bg-white/20">
                    Marcar en camino
                  </button>
                </form>
              )}

              {order.status === "EN_CAMINO" && (
                <form
                  action={async () => {
                    "use server";
                    await updateDeliveryStatus(order._id, "ENTREGADO");
                  }}
                >
                  <button className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
                    Marcar entregado
                  </button>
                </form>
              )}

              {(order.status === "TOMADO" || order.status === "EN_CAMINO") && (
                <form
                  action={async () => {
                    "use server";
                    await updateDeliveryStatus(order._id, "CANCELADO");
                  }}
                >
                  <button className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-400">
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
            No hay pedidos disponibles.
          </div>
        )}
      </div>
    </div>
  );
}