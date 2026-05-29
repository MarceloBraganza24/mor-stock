import {
  addCashMovement,
  closeCashRegister,
  getCashHistory,
  getOpenCashMovements,
  getOpenCashRegister,
  openCashRegister,
  reviewCashRegister
} from "@/actions/cash.actions";
import { TableContainer } from "@/components/ui/TableContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caja | MorStock",
};

export default async function CajaPage() {
  const cashRegister = await getOpenCashRegister();
  const movements = await getOpenCashMovements();
  const history = await getCashHistory();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Control diario</p>
        <h1 className="mt-2 text-3xl font-bold">Caja diaria</h1>
        <p className="mt-2 app-muted">
          Abrí caja, registrá movimientos y cerrá el día con trazabilidad.
        </p>
      </div>

      <a
        href="/api/reportes/caja"
        className="inline-flex mb-6 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20"
      >
        Exportar CSV
      </a>

      {!cashRegister ? (
        <form
          action={openCashRegister}
          className="mb-8 max-w-xl app-card-2xl p-5"
        >
          <h2 className="text-xl font-semibold">Abrir caja</h2>

          <input
            name="openingAmount"
            type="number"
            placeholder="Monto inicial"
            className="mt-4 w-full app-input outline-none focus:border-emerald-500"
          />

          <button className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
            Abrir caja
          </button>
        </form>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="app-card-2xl p-5">
              <p className="text-sm app-muted">Monto inicial</p>
              <h2 className="mt-3 text-2xl font-bold">
                ${cashRegister.openingAmount}
              </h2>
            </div>

            <div className="app-card-2xl p-5">
              <p className="text-sm app-muted">Esperado en caja</p>
              <h2 className="mt-3 text-2xl font-bold">
                ${cashRegister.expectedAmount}
              </h2>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-300">Estado</p>
              <h2 className="mt-3 text-2xl font-bold text-emerald-400">
                ABIERTA
              </h2>
            </div>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <form
              action={addCashMovement}
              className="app-card-2xl p-5"
            >
              <h2 className="text-xl font-semibold">Movimiento manual</h2>

              <select
                name="type"
                className="mt-4 w-full app-input outline-none focus:border-emerald-500"
              >
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>

              <input
                name="amount"
                type="number"
                placeholder="Monto"
                required
                className="mt-3 w-full app-input outline-none focus:border-emerald-500"
              />

              <input
                name="description"
                placeholder="Descripción"
                className="mt-3 w-full app-input outline-none focus:border-emerald-500"
              />

              <button className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
                Registrar movimiento
              </button>
            </form>

            <form
              action={closeCashRegister}
              className="app-card-2xl p-5"
            >
              <h2 className="text-xl font-semibold">Cerrar caja</h2>

              <p className="mt-2 text-sm app-muted">
                Esperado en caja: ${cashRegister.expectedAmount}
              </p>

              <input
                name="closingAmount"
                type="number"
                placeholder="Monto contado real"
                required
                className="mt-4 w-full app-input outline-none focus:border-emerald-500"
              />

              <button className="mt-4 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400">
                Cerrar caja
              </button>
            </form>
          </div>

          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-[750px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/60">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Origen</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Monto</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement: any) => (
                  <tr key={movement._id} className="border-t border-white/10">
                    <td className="px-4 py-3 app-muted">
                      {new Date(movement.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3">{movement.type}</td>

                    <td className="px-4 py-3 text-white/60">
                      {movement.source}
                    </td>

                    <td className="px-4 py-3 text-white/60">
                      {movement.description || "-"}
                    </td>

                    <td
                      className={`px-4 py-3 font-semibold ${
                        movement.type === "EGRESO"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {movement.type === "EGRESO" ? "-" : "+"}$
                      {movement.amount}
                    </td>
                  </tr>
                ))}

                {movements.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      Todavía no hay movimientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <TableContainer minWidth="1100px">

        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-white/60">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Inicial</th>
              <th className="px-4 py-3">Esperado</th>
              <th className="px-4 py-3">Contado</th>
              <th className="px-4 py-3">Diferencia</th>
            </tr>
          </thead>

          <tbody>
            {history.map((cash: any) => (
              <tr key={cash._id} className="border-t border-white/10">
                <td className="px-4 py-3 text-white/60">
                  {new Date(cash.createdAt).toLocaleDateString("es-AR")}
                </td>

                <td className="px-4 py-3">{cash.status}</td>
                <td className="px-4 py-3">${cash.openingAmount}</td>
                <td className="px-4 py-3">${cash.expectedAmount}</td>

                <td className="px-4 py-3">
                  {cash.closingAmount !== null ? `$${cash.closingAmount}` : "-"}
                </td>

                <td
                  className={`px-4 py-3 font-semibold ${
                    cash.difference < 0
                      ? "text-red-400"
                      : cash.difference > 0
                      ? "text-emerald-400"
                      : "text-white"
                  }`}
                >
                  ${cash.difference}
                </td>
                {cash.status === "CERRADA" && (
                  <form
                    action={async () => {
                      "use server";
                      await reviewCashRegister(cash._id);
                    }}
                  >
                    <button className="text-sm text-emerald-400 hover:text-emerald-300">
                      Marcar revisada
                    </button>
                  </form>
                )}
              </tr>
            ))}

            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  Todavía no hay historial de caja.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </TableContainer>

      </div>
  );
}