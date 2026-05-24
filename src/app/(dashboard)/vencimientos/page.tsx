import { getProducts } from "@/actions/product.actions";
import {
  createProductBatch,
  getExpirationAlerts,
  getProductBatches,
} from "@/actions/batch.actions";

export default async function VencimientosPage() {
  const products = await getProducts();
  const alerts = await getExpirationAlerts();
  const batches = await getProductBatches();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Control de mercadería
        </p>
        <h1 className="mt-2 text-3xl font-bold">Vencimientos</h1>
        <p className="mt-2 text-white/50">
          Cargá lotes con fecha de vencimiento y recibí alertas antes de que expiren.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <p className="text-sm text-red-300">Alertas próximas</p>
          <h2 className="mt-3 text-2xl font-bold text-red-400">
            {alerts.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Lotes activos</p>
          <h2 className="mt-3 text-2xl font-bold">{batches.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Días de alerta</p>
          <h2 className="mt-3 text-2xl font-bold">30</h2>
        </div>
      </div>

      <form
        action={createProductBatch}
        className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-5"
      >
        <select
          name="productId"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500 md:col-span-2"
        >
          <option value="">Seleccionar producto</option>
          {products.map((product: any) => (
            <option key={product._id} value={product._id}>
              {product.name} - Stock actual: {product.stock}
            </option>
          ))}
        </select>

        <input
          name="batchCode"
          placeholder="Lote opcional"
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          name="quantity"
          type="number"
          placeholder="Cantidad"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          name="expirationDate"
          type="date"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 md:col-span-5">
          Cargar lote con vencimiento
        </button>
      </form>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Productos por vencer</h2>

        <div className="grid gap-4">
          {alerts.map((batch: any) => {
            const expiration = new Date(batch.expirationDate);
            const today = new Date();
            const diffDays = Math.ceil(
              (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={batch._id}
                className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {batch.product?.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      Cantidad: {batch.quantity} · Lote:{" "}
                      {batch.batchCode || "Sin lote"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-red-300">
                      {diffDays < 0
                        ? "Vencido"
                        : diffDays === 0
                        ? "Vence hoy"
                        : `Vence en ${diffDays} días`}
                    </p>
                    <p className="font-bold text-red-400">
                      {expiration.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
              No hay productos próximos a vencer.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Todos los lotes</h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Lote</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((batch: any) => {
                const expiration = new Date(batch.expirationDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const isExpired = expiration < today;

                return (
                  <tr key={batch._id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">
                      {batch.product?.name}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {batch.batchCode || "-"}
                    </td>
                    <td className="px-4 py-3">{batch.quantity}</td>
                    <td className="px-4 py-3">
                      {expiration.toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      {isExpired ? (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
                          Vencido
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                          Vigente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no cargaste lotes con vencimiento.
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