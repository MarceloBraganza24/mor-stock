import { getCustomers } from "@/actions/customer.actions";
import { getProducts } from "@/actions/product.actions";
import { getActivePromotions } from "@/actions/promotion.actions";
import {
  getSalesHistory,
  getTodaySales,
  cancelSale,
  getAvailableCombos
} from "@/actions/sale.actions";
import { SalesPoint } from "@/components/SalesPoint";
import { TableContainer } from "@/components/ui/TableContainer";
import NextLink from "next/link";

type Props = {
  searchParams: Promise<{
    paymentMethod?: string;
    from?: string;
    to?: string;
  }>;
};

const inputClass =
  "min-h-12 app-input text-base outline-none transition focus:border-emerald-500";

const metricCardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

export default async function VentasPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const products = await getProducts();

  const customers = await getCustomers();

  const todaySales = await getTodaySales();

  const combos = await getAvailableCombos();

  const promotions =
    await getActivePromotions();

  const salesHistory = await getSalesHistory({
    paymentMethod:
      params.paymentMethod || "TODOS",
    from: params.from,
    to: params.to,
  });

  const totalToday = todaySales.reduce(
    (acc: number, sale: any) =>
      acc + sale.total,
    0
  );

  const totalHistory = salesHistory.reduce(
    (acc: number, sale: any) =>
      acc + sale.total,
    0
  );

  const profitHistory = salesHistory.reduce(
    (acc: number, sale: any) =>
      acc + sale.profit,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Punto de venta
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Ventas
        </h1>

        <p className="mt-2 app-muted">
          Registrá ventas rápidas,
          descontá stock y consultá el
          historial.
        </p>
      </div>

      <NextLink
        href="/ventas/manual"
        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Venta manual
      </NextLink>

      <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={metricCardClass}>
          <p className="text-sm app-muted">
            Ventas de hoy
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            ${totalToday}
          </h2>
        </div>

        <div className={metricCardClass}>
          <p className="text-sm app-muted">
            Cantidad hoy
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {todaySales.length}
          </h2>
        </div>

        <div className={metricCardClass}>
          <p className="text-sm app-muted">
            Productos cargados
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {products.length}
          </h2>
        </div>
      </div>

      <SalesPoint
        products={products}
        customers={customers}
        combos={combos}
        promotions={promotions}
      />

      <div className="mt-10">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-400">
            Historial detallado
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Ventas registradas
          </h2>

          <p className="mt-2 app-muted">
            Filtrá ventas por fecha y
            método de pago.
          </p>
        </div>

        <form
          action="/ventas"
          className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4"
        >
          <select
            name="paymentMethod"
            defaultValue={
              params.paymentMethod ||
              "TODOS"
            }
            className={inputClass}
          >
            <option value="TODOS">
              Todos los métodos
            </option>

            <option value="EFECTIVO">
              Efectivo
            </option>

            <option value="TRANSFERENCIA">
              Transferencia
            </option>

            <option value="DEBITO">
              Débito
            </option>

            <option value="CREDITO">
              Crédito
            </option>

            <option value="QR">
              QR
            </option>

            <option value="FIADO">
              Fiado
            </option>
          </select>

          <input
            name="from"
            type="date"
            defaultValue={params.from || ""}
            className={inputClass}
          />

          <input
            name="to"
            type="date"
            defaultValue={params.to || ""}
            className={inputClass}
          />

          <button className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50">
            Filtrar
          </button>
        </form>

        <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={metricCardClass}>
            <p className="text-sm app-muted">
              Total filtrado
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              ${totalHistory}
            </h2>
          </div>

          <div className={metricCardClass}>
            <p className="text-sm app-muted">
              Ganancia filtrada
            </p>

            <h2 className="mt-3 text-2xl font-bold text-emerald-400 sm:text-3xl">
              ${profitHistory}
            </h2>
          </div>

          <div className={metricCardClass}>
            <p className="text-sm app-muted">
              Ventas encontradas
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              {salesHistory.length}
            </h2>
          </div>
        </div>

        <TableContainer minWidth="1100px">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">
                  Fecha
                </th>

                <th className="px-4 py-3">
                  Productos
                </th>

                <th className="px-4 py-3">
                  Pago
                </th>

                <th className="px-4 py-3">
                  Cliente
                </th>

                <th className="px-4 py-3">
                  Ganancia
                </th>

                <th className="px-4 py-3">
                  Total
                </th>

                <th className="px-4 py-3">
                  Usuario
                </th>

                <th className="px-4 py-3">
                  Ticket
                </th>

                <th className="px-4 py-3">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {salesHistory.map((sale: any) => (
                <tr
                  key={sale._id}
                  className="border-t border-white/10 align-top"
                >
                  <td className="px-4 py-4 text-white/60">
                    {new Date(
                      sale.createdAt
                    ).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-4">
                    {sale.items.map(
                      (item: any) => (
                        <div
                          key={`${sale._id}-${item.product}`}
                          className="mb-3"
                        >
                          <p className="font-medium">
                            {item.quantity}x{" "}
                            {item.name}
                          </p>

                          {item.batches
                            ?.length > 0 && (
                            <div className="mt-1 space-y-1 text-xs text-white/40">
                              {item.batches.map(
                                (
                                  batch: any
                                ) => (
                                  <p
                                    key={
                                      batch.batch
                                    }
                                  >
                                    Lote:{" "}
                                    {batch.batchCode ||
                                      "-"}{" "}
                                    · Cant:{" "}
                                    {
                                      batch.quantity
                                    }{" "}
                                    · Vence:{" "}
                                    {new Date(
                                      batch.expirationDate
                                    ).toLocaleDateString(
                                      "es-AR"
                                    )}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </td>

                  <td className="px-4 py-4 text-white/70">
                    {sale.paymentMethod}
                  </td>

                  <td className="px-4 py-4 text-white/70">
                    {sale.customer?.name ||
                      "-"}
                  </td>

                  <td className="px-4 py-4 font-semibold text-emerald-400">
                    ${sale.profit}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    ${sale.total}
                  </td>

                  <td className="px-4 py-4 text-white/70">
                    {sale.user?.name ||
                      "-"}
                  </td>

                  <td className="px-4 py-4">
                    <a
                      href={`/ventas/${sale._id}/ticket`}
                      className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Imprimir
                    </a>
                  </td>

                  <td className="px-4 py-4">
                    <form
                      action={async () => {
                        "use server";

                        await cancelSale(
                          sale._id
                        );
                      }}
                    >
                      <button className="text-sm font-medium text-red-400 hover:text-red-300">
                        Cancelar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {salesHistory.length ===
                0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    No se encontraron
                    ventas con esos
                    filtros.
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