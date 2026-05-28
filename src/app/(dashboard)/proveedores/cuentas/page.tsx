import {
  getSupplierAccounts,
  getSupplierMovements,
} from "@/actions/supplier-account.actions";
import { SupplierAccountForm } from "@/components/SupplierAccountForm";

type Props = {
  searchParams: Promise<{
    supplierId?: string;
  }>;
};

export default async function SupplierAccountsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const suppliers = await getSupplierAccounts();

  const selectedSupplierId =
    params.supplierId || suppliers[0]?._id || "";

  const movements = selectedSupplierId
    ? await getSupplierMovements(selectedSupplierId)
    : [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Proveedores
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Cuenta corriente proveedores
        </h1>

        <p className="mt-2 app-muted">
          Controlá deudas, pagos y saldos por proveedor.
        </p>
      </div>

      <SupplierAccountForm suppliers={suppliers} />

      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="app-card-2xl p-5">
          <h2 className="text-xl font-semibold">
            Proveedores
          </h2>

          <div className="mt-5 space-y-3">
            {suppliers.map((supplier: any) => (
              <a
                key={supplier._id}
                href={`/proveedores/cuentas?supplierId=${supplier._id}`}
                className={`block rounded-xl border px-4 py-3 ${
                  selectedSupplierId === supplier._id
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="font-medium">{supplier.name}</p>

                <p className="mt-1 text-sm app-muted">
                  Saldo: $
                  {Number(supplier.balance || 0).toLocaleString("es-AR")}
                </p>
              </a>
            ))}

            {suppliers.length === 0 && (
              <p className="app-muted">
                Todavía no hay proveedores.
              </p>
            )}
          </div>
        </div>

        <div className="app-card-2xl p-5">
          <h2 className="text-xl font-semibold">
            Movimientos
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-white/[0.04] app-muted">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Importe</th>
                  <th className="px-4 py-3">Usuario</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement: any) => (
                  <tr
                    key={movement._id}
                    className="border-t border-white/10"
                  >
                    <td className="px-4 py-3 app-muted">
                      {new Date(movement.createdAt).toLocaleString("es-AR")}
                    </td>

                    <td className="px-4 py-3">
                      {movement.type === "DEBT" && "Deuda"}
                      {movement.type === "PAYMENT" && "Pago"}
                      {movement.type === "ADJUSTMENT" && "Ajuste"}
                    </td>

                    <td className="px-4 py-3 app-muted">
                      {movement.description || "-"}
                    </td>

                    <td
                      className={`px-4 py-3 font-semibold ${
                        movement.type === "DEBT"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      ${Number(movement.amount || 0).toLocaleString("es-AR")}
                    </td>

                    <td className="px-4 py-3 app-muted">
                      {movement.user?.name || "-"}
                    </td>
                  </tr>
                ))}

                {movements.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center app-muted"
                    >
                      No hay movimientos para este proveedor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}