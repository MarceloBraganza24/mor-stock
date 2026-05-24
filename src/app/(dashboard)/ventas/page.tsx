import { getCustomers } from "@/actions/customer.actions";
import { getProducts } from "@/actions/product.actions";
import { getSalesHistory, getTodaySales,cancelSale } from "@/actions/sale.actions";
import { SalesPoint } from "@/components/SalesPoint";
import { TableContainer } from "@/components/ui/TableContainer";

type Props = {
  searchParams: Promise<{
    paymentMethod?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function VentasPage({ searchParams }: Props) {
  const params = await searchParams;

  const products = await getProducts();
  const customers = await getCustomers();

  const todaySales = await getTodaySales();

  const salesHistory = await getSalesHistory({
    paymentMethod: params.paymentMethod || "TODOS",
    from: params.from,
    to: params.to,
  });

  const totalToday = todaySales.reduce(
    (acc: number, sale: any) => acc + sale.total,
    0
  );

  const totalHistory = salesHistory.reduce(
    (acc: number, sale: any) => acc + sale.total,
    0
  );

  const profitHistory = salesHistory.reduce(
    (acc: number, sale: any) => acc + sale.profit,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Punto de venta</p>
        <h1 className="mt-2 text-3xl font-bold">Ventas</h1>
        <p className="mt-2 text-white/50">
          Registrá ventas rápidas, descontá stock y consultá el historial.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Ventas de hoy</p>
          <h2 className="mt-3 text-2xl font-bold">${totalToday}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Cantidad hoy</p>
          <h2 className="mt-3 text-2xl font-bold">{todaySales.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Productos cargados</p>
          <h2 className="mt-3 text-2xl font-bold">{products.length}</h2>
        </div>
      </div>

      <SalesPoint products={products} customers={customers} />

      <div className="mt-10">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-400">
            Historial detallado
          </p>
          <h2 className="mt-2 text-2xl font-bold">Ventas registradas</h2>
          <p className="mt-2 text-white/50">
            Filtrá ventas por fecha y método de pago.
          </p>
        </div>

        <form
          action="/ventas"
          className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-4"
        >
          <select
            name="paymentMethod"
            defaultValue={params.paymentMethod || "TODOS"}
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="TODOS">Todos los métodos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="QR">QR</option>
            <option value="FIADO">Fiado</option>
          </select>

          <input
            name="from"
            type="date"
            defaultValue={params.from || ""}
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <input
            name="to"
            type="date"
            defaultValue={params.to || ""}
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400">
            Filtrar
          </button>
        </form>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/50">Total filtrado</p>
            <h2 className="mt-3 text-2xl font-bold">${totalHistory}</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/50">Ganancia filtrada</p>
            <h2 className="mt-3 text-2xl font-bold">${profitHistory}</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/50">Ventas encontradas</p>
            <h2 className="mt-3 text-2xl font-bold">{salesHistory.length}</h2>
          </div>
        </div>


        <TableContainer minWidth="1100px">
          
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Ganancia</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {salesHistory.map((sale: any) => (
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
                      <div key={`${sale._id}-${item.product}`} className="mb-2">
                        <p>
                          {item.quantity}x {item.name}
                        </p>

                        {item.batches?.length > 0 && (
                          <div className="mt-1 space-y-1 text-xs text-white/40">
                            {item.batches.map((batch: any) => (
                              <p key={batch.batch}>
                                Lote: {batch.batchCode || "-"} · Cant: {batch.quantity} · Vence:{" "}
                                {new Date(batch.expirationDate).toLocaleDateString("es-AR")}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </td>

                  <td className="px-4 py-3 text-white/70">
                    {sale.paymentMethod}
                  </td>

                  <td className="px-4 py-3 text-white/70">
                    {sale.customer?.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-emerald-400">
                    ${sale.profit}
                  </td>

                  <td className="px-4 py-3 font-semibold">${sale.total}</td>

                  <td className="px-4 py-3 text-white/70">
                    {sale.user?.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await cancelSale(sale._id);
                      }}
                    >
                      <button className="text-sm text-red-400 hover:text-red-300">
                        Cancelar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {salesHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    No se encontraron ventas con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </TableContainer>

          
        </div>
      </div>
    </div>
  );
}