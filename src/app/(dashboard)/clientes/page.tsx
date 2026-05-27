import {
  addDebt,
  createCustomer,
  deleteCustomer,
  getCreditMovements,
  getCustomers,
  registerPayment,
} from "@/actions/customer.actions";
import { TableContainer } from "@/components/ui/TableContainer";

const inputClass =
  "min-h-12 app-input text-base outline-none transition focus:border-emerald-500";

const darkInputClass =
  "min-h-12 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-base outline-none transition focus:border-emerald-500";

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

export default async function ClientesPage() {
  const customers = await getCustomers();
  const movements = await getCreditMovements();

  const totalDebt = customers.reduce(
    (acc: number, customer: any) => acc + customer.balance,
    0
  );

  const totalDebtsCreated = movements
    .filter((movement: any) => movement.type === "DEUDA")
    .reduce((acc: number, movement: any) => acc + movement.amount, 0);

  const totalPayments = movements
    .filter((movement: any) => movement.type === "PAGO")
    .reduce((acc: number, movement: any) => acc + movement.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Fiados</p>
        <h1 className="mt-2 text-3xl font-bold">Clientes</h1>
        <p className="mt-2 app-muted">
          Controlá saldos, pagos, deudas e historial de fiados.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm app-muted">Clientes activos</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {customers.length}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Saldo fiado actual</p>
          <h2 className="mt-3 text-2xl font-bold text-red-400 sm:text-3xl">
            ${totalDebt}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Deudas registradas</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            ${totalDebtsCreated}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Pagos recibidos</p>
          <h2 className="mt-3 text-2xl font-bold text-emerald-400 sm:text-3xl">
            ${totalPayments}
          </h2>
        </div>
      </div>

      <form
        action={createCustomer}
        className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          name="name"
          placeholder="Nombre del cliente"
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
          Agregar cliente
        </button>
      </form>

      <div className="mb-10 grid gap-4">
        {customers.map((customer: any) => {
          const customerMovements = movements.filter(
            (movement: any) => movement.customer?._id === customer._id
          );

          return (
            <div key={customer._id} className={cardClass}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-semibold">{customer.name}</h2>

                  <p className="mt-1 text-sm app-muted">
                    {customer.phone || "Sin teléfono"}
                  </p>

                  {customer.notes && (
                    <p className="mt-1 text-sm text-white/40">
                      {customer.notes}
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm app-muted">Saldo pendiente</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      customer.balance > 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    ${customer.balance}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <form
                  action={addDebt}
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5"
                >
                  <input type="hidden" name="customerId" value={customer._id} />

                  <p className="mb-3 text-sm font-medium text-white/70">
                    Agregar deuda manual
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto"
                      required
                      className={darkInputClass}
                    />

                    <input
                      name="description"
                      placeholder="Descripción"
                      className={darkInputClass}
                    />
                  </div>

                  <button className="mt-3 min-h-12 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400">
                    Sumar fiado
                  </button>
                </form>

                <form
                  action={registerPayment}
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5"
                >
                  <input type="hidden" name="customerId" value={customer._id} />

                  <p className="mb-3 text-sm font-medium text-white/70">
                    Registrar pago
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monto"
                      required
                      className={darkInputClass}
                    />

                    <input
                      name="description"
                      placeholder="Descripción"
                      defaultValue="Pago recibido"
                      className={darkInputClass}
                    />
                  </div>

                  <select
                    name="paymentMethod"
                    defaultValue="EFECTIVO"
                    className={`mt-3 w-full ${darkInputClass}`}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                    <option value="QR">QR</option>
                  </select>

                  <button className="mt-3 min-h-12 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400">
                    Registrar pago
                  </button>
                </form>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
                <h3 className="mb-3 font-semibold">Historial del cliente</h3>

                <div className="space-y-2">
                  {customerMovements.slice(0, 5).map((movement: any) => (
                    <div
                      key={movement._id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-neutral-950 px-3 py-3 text-sm"
                    >
                      <div>
                        <p
                          className={
                            movement.type === "DEUDA"
                              ? "font-medium text-red-400"
                              : "font-medium text-emerald-400"
                          }
                        >
                          {movement.type}
                        </p>

                        <p className="app-muted">
                          {movement.description || "-"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">${movement.amount}</p>
                        <p className="text-xs text-white/40">
                          {new Date(movement.createdAt).toLocaleDateString(
                            "es-AR"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  {customerMovements.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-white/40">
                      Sin movimientos todavía.
                    </p>
                  )}
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await deleteCustomer(customer._id);
                }}
                className="mt-4"
              >
                <button className="text-sm font-medium text-red-400 hover:text-red-300">
                  Eliminar cliente
                </button>
              </form>
            </div>
          );
        })}

        {customers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/40">
            Todavía no cargaste clientes.
          </div>
        )}
      </div>

      <div>
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Historial general
          </p>
          <h2 className="mt-2 text-2xl font-bold">Movimientos de fiado</h2>
        </div>

        <TableContainer minWidth="1100px">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Pago</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement: any) => (
                <tr key={movement._id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/60">
                    {new Date(movement.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3">
                    {movement.customer?.name || "-"}
                  </td>

                  <td
                    className={`px-4 py-3 font-medium ${
                      movement.type === "DEUDA"
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {movement.type}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {movement.description || "-"}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    ${movement.amount}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {movement.user?.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-white/60">
                    {movement.paymentMethod || "-"}
                  </td>
                </tr>
              ))}

              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no hay movimientos de fiado.
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