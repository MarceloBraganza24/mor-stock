import { getCurrentStore, updateStoreSettings } from "@/actions/store.actions";

export default async function ConfiguracionPage() {
  const store = await getCurrentStore();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Sistema</p>
        <h1 className="mt-2 text-3xl font-bold">Configuración del comercio</h1>
        <p className="mt-2 text-white/50">
          Datos generales usados en tickets, reportes, envíos y alertas.
        </p>
      </div>

      <form
        action={updateStoreSettings}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2"
      >
        <input name="name" defaultValue={store?.name || ""} placeholder="Nombre del comercio" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="city" defaultValue={store?.city || ""} placeholder="Ciudad" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="address" defaultValue={store?.address || ""} placeholder="Dirección" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="phone" defaultValue={store?.phone || ""} placeholder="Teléfono" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="businessType" defaultValue={store?.businessType || ""} placeholder="Rubro: kiosco, mercado, despensa..." className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <select name="currency" defaultValue={store?.currency || "ARS"} className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3">
          <option value="ARS">ARS - Pesos argentinos</option>
          <option value="USD">USD - Dólares</option>
        </select>

        <input name="logoUrl" defaultValue={store?.logoUrl || ""} placeholder="URL del logo" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="openingHours" defaultValue={store?.openingHours || ""} placeholder="Horarios de atención" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="expirationAlertDays" type="number" defaultValue={store?.expirationAlertDays || 30} placeholder="Días alerta vencimiento" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <input name="defaultDeliveryFee" type="number" defaultValue={store?.defaultDeliveryFee || 0} placeholder="Costo default motomandado" className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3" />

        <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 md:col-span-2">
          Guardar configuración
        </button>
      </form>
    </div>
  );
}