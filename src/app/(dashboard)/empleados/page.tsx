import {
  deleteEmployee,
  getEmployees,
} from "@/actions/employee.actions";
import { TableContainer } from "@/components/ui/TableContainer";
import { EmployeeCreateForm } from "@/components/EmployeeCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empleados | MorStock",
};

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

function getRoleLabel(role: string) {
  if (role === "OWNER") return "Dueño";
  if (role === "CASHIER") return "Cajero";
  if (role === "STOCKER") return "Repositor";
  if (role === "DELIVERY") return "Motomandado";
  if (role === "SUPER_ADMIN") return "Super Admin";

  return role;
}

function getRoleClass(role: string) {
  if (role === "CASHIER") {
    return "bg-emerald-500/10 text-emerald-400";
  }

  if (role === "STOCKER") {
    return "bg-blue-500/10 text-blue-400";
  }

  if (role === "DELIVERY") {
    return "bg-amber-500/10 text-amber-400";
  }

  if (role === "OWNER") {
    return "bg-purple-500/10 text-purple-400";
  }

  return "bg-white/10 text-white/60";
}

export default async function EmpleadosPage() {
  const employees = await getEmployees();

  const cashiers = employees.filter(
    (employee: any) => employee.role === "CASHIER"
  ).length;

  const stockers = employees.filter(
    (employee: any) => employee.role === "STOCKER"
  ).length;

  const deliveries = employees.filter(
    (employee: any) => employee.role === "DELIVERY"
  ).length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Equipo</p>

        <h1 className="mt-2 text-3xl font-bold">Empleados</h1>

        <p className="mt-2 app-muted">
          Creá usuarios para que puedan operar el sistema sin usar tu cuenta.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm app-muted">Empleados activos</p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {employees.length}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Cajeros</p>

          <h2 className="mt-3 text-2xl font-bold text-emerald-400 sm:text-3xl">
            {cashiers}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Repositorios</p>

          <h2 className="mt-3 text-2xl font-bold text-blue-400 sm:text-3xl">
            {stockers}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">Motomandados</p>

          <h2 className="mt-3 text-2xl font-bold text-amber-400 sm:text-3xl">
            {deliveries}
          </h2>
        </div>
      </div>

      <EmployeeCreateForm />

      <div className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Usuarios del comercio
          </p>

          <h2 className="mt-2 text-2xl font-bold">Listado de empleados</h2>

          <p className="mt-2 app-muted">
            Revisá roles, accesos y usuarios activos del sistema.
          </p>
        </div>

        <TableContainer minWidth="900px">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.04] text-white/60">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee: any) => (
                <tr
                  key={employee._id}
                  className="border-t border-white/10 align-top"
                >
                  <td className="px-4 py-4 font-medium">{employee.name}</td>

                  <td className="px-4 py-4 text-white/60">
                    {employee.email}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleClass(
                        employee.role
                      )}`}
                    >
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-white/60">
                    {new Date(employee.createdAt).toLocaleDateString("es-AR")}
                  </td>

                  <td className="px-4 py-4">
                    <form
                      action={async () => {
                        "use server";
                        await deleteEmployee(employee._id);
                      }}
                    >
                      <button className="text-sm font-medium text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    Todavía no cargaste empleados.
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