import {
  createEmployee,
  deleteEmployee,
  getEmployees,
} from "@/actions/employee.actions";
import { TableContainer } from "@/components/ui/TableContainer";

export default async function EmpleadosPage() {
  const employees = await getEmployees();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Equipo</p>
        <h1 className="mt-2 text-3xl font-bold">Empleados</h1>
        <p className="mt-2 text-white/50">
          Creá usuarios para que puedan operar el sistema sin usar tu cuenta.
        </p>
      </div>

      <form
        action={createEmployee}
        className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-5"
      >
        <input
          name="name"
          placeholder="Nombre"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <select
            name="role"
            required
            className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none focus:border-emerald-500"
            >
            <option value="">Seleccionar rol</option>
            <option value="CASHIER">Cajero: ventas + caja</option>
            <option value="STOCKER">Repositor: productos + stock</option>
        </select>

        <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 hover:bg-emerald-400">
          Crear empleado
        </button>
      </form>


        <TableContainer minWidth="1100px">
            
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/60">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee: any) => (
                  <tr key={employee._id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">{employee.name}</td>
                    <td className="px-4 py-3 text-white/60">{employee.email}</td>
                    <td className="px-4 py-3 text-white/60">{employee.role}</td>
                    <td className="px-4 py-3 text-white/60">
                      {new Date(employee.createdAt).toLocaleDateString("es-AR")}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteEmployee(employee._id);
                        }}
                      >

                        <button className="text-red-400 hover:text-red-300">
                          Eliminar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-white/40">
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