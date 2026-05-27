import {
  getTrashItems,
  permanentlyDeleteTrashItem,
  restoreTrashItem,
} from "@/actions/trash.actions";

export default async function PapeleraPage() {
  const trash = await getTrashItems();

  const sections = [
    { title: "Productos", type: "product", items: trash.products },
    { title: "Clientes", type: "customer", items: trash.customers },
    { title: "Proveedores", type: "supplier", items: trash.suppliers },
    { title: "Empleados", type: "employee", items: trash.employees },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Seguridad</p>
        <h1 className="mt-2 text-3xl font-bold">Papelera</h1>
        <p className="mt-2 text-white/50">
          Restaurá elementos eliminados o borralos permanentemente.
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <section
            key={section.type}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>

            <div className="mt-4 grid gap-3">
              {section.items.map((item: any) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-neutral-900 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {item.name || item.email || "Sin nombre"}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      Eliminado / desactivado
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <form
                      action={async () => {
                        "use server";
                        await restoreTrashItem(section.type, item._id);
                      }}
                    >
                      <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400">
                        Restaurar
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await permanentlyDeleteTrashItem(section.type, item._id);
                      }}
                    >
                      <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400">
                        Eliminar definitivo
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              {section.items.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
                  No hay {section.title.toLowerCase()} en papelera.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}