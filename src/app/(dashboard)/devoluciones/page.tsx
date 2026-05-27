import {
  createReturnAdjustment,
  getReturnAdjustments,
  getReturnableSales,
} from "@/actions/return.actions";
import { TableContainer } from "@/components/ui/TableContainer";

export default async function DevolucionesPage() {
  const sales = await getReturnableSales();
  const adjustments = await getReturnAdjustments();

  const totalReturned = adjustments.reduce(
    (acc: number, adjustment: any) => acc + adjustment.amount,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Auditoría y ajustes
        </p>
        <h1 className="mt-2 text-3xl font-bold">Devoluciones</h1>
        <p className="mt-2 app-muted">
          Registrá devoluciones históricas, devolvé stock y dejá trazabilidad.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Ventas disponibles</p>
          <h2 className="mt-3 text-2xl font-bold">{sales.length}</h2>
        </div>

        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Devoluciones registradas</p>
          <h2 className="mt-3 text-2xl font-bold">{adjustments.length}</h2>
        </div>

        <div className="app-card-2xl p-5">
          <p className="text-sm app-muted">Total devuelto</p>
          <h2 className="mt-3 text-2xl font-bold text-red-400">
            ${totalReturned}
          </h2>
        </div>
      </div>

      <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Fecha venta</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale: any) => (
              <tr key={sale._id} className="border-t border-white/10">
                <td className="px-4 py-3 text-white/60">
                  {new Date(sale.createdAt).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-4 py-3">
                  {sale.items.map((item: any) => (
                    <div key={`${sale._id}-${item.product}`}>
                      {item.quantity}x {item.name}
                    </div>
                  ))}
                </td>

                <td className="px-4 py-3 text-white/70">
                  {sale.paymentMethod}
                </td>

                <td className="px-4 py-3 text-white/70">
                  {sale.customer?.name || "-"}
                </td>

                <td className="px-4 py-3 text-white/70">
                  {sale.user?.name || "-"}
                </td>

                <td className="px-4 py-3 font-semibold">${sale.total}</td>

                <td className="px-4 py-3">
                  <form
                    id={`return-${sale._id}`}
                    action={createReturnAdjustment}
                  >
                    <input type="hidden" name="saleId" value={sale._id} />
                    <input
                      name="reason"
                      placeholder="Motivo"
                      className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </form>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    form={`return-${sale._id}`}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Registrar devolución
                  </button>
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-white/40">
                  No hay ventas disponibles para devolver.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Historial histórico
          </p>
          <h2 className="mt-2 text-2xl font-bold">Ajustes registrados</h2>
        </div>


          <TableContainer minWidth="1100px">

            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/60">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Venta</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Caja</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Monto</th>
                </tr>
              </thead>

              <tbody>
                {adjustments.map((adjustment: any) => (
                  <tr key={adjustment._id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white/60">
                      {new Date(adjustment.createdAt).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      #{adjustment.sale?._id?.slice(-6)}
                    </td>

                    <td className="px-4 py-3 text-white/70">
                      {adjustment.paymentMethod}
                    </td>

                    <td className="px-4 py-3 text-white/70">
                      {adjustment.customer?.name || "-"}
                    </td>

                    <td className="px-4 py-3 text-white/70">
                      {adjustment.user?.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {adjustment.affectsCashRegister ? (
                        <span className="text-emerald-400">Impactó caja</span>
                      ) : (
                        <span className="text-white/40">No impactó caja</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-white/60">
                      {adjustment.reason || "-"}
                    </td>

                    <td className="px-4 py-3 font-semibold text-red-400">
                      -${adjustment.amount}
                    </td>
                  </tr>
                ))}

                {adjustments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-white/40">
                      Todavía no hay devoluciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
          </TableContainer>

        </div>
      </div>
  );
}