import {
  getCurrentStore,
  updateStoreSettings,
} from "@/actions/store.actions";

import { StoreLogoUpload } from "@/components/StoreLogoUpload";
import { RestoreBackupForm } from "@/components/RestoreBackupForm";

const inputClass =
  "min-h-12 app-input text-base outline-none transition focus:border-emerald-500";

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5";

export default async function ConfiguracionPage() {
  const store = await getCurrentStore();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">
          Sistema
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Configuración del comercio
        </h1>

        <p className="mt-2 app-muted">
          Datos generales usados en tickets,
          reportes, envíos y alertas.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="/api/backup"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
        >
          Descargar backup general
        </a>
      </div>

      <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm app-muted">
            Comercio
          </p>

          <h2 className="mt-3 text-xl font-bold">
            {store?.name || "-"}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">
            Ciudad
          </p>

          <h2 className="mt-3 text-xl font-bold">
            {store?.city || "-"}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">
            Moneda
          </p>

          <h2 className="mt-3 text-xl font-bold">
            {store?.currency || "ARS"}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm app-muted">
            Rubro
          </p>

          <h2 className="mt-3 text-xl font-bold">
            {store?.businessType || "-"}
          </h2>
        </div>
      </div>

      <form
        action={updateStoreSettings}
        className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          name="name"
          defaultValue={store?.name || ""}
          placeholder="Nombre del comercio"
          className={inputClass}
        />

        <input
          name="city"
          defaultValue={store?.city || ""}
          placeholder="Ciudad"
          className={inputClass}
        />

        <input
          name="address"
          defaultValue={store?.address || ""}
          placeholder="Dirección"
          className={inputClass}
        />

        <input
          name="phone"
          defaultValue={store?.phone || ""}
          placeholder="Teléfono"
          className={inputClass}
        />

        <input
          name="businessType"
          defaultValue={store?.businessType || ""}
          placeholder="Rubro: kiosco, mercado, despensa..."
          className={inputClass}
        />

        <select
          name="currency"
          defaultValue={store?.currency || "ARS"}
          className={inputClass}
        >
          <option value="ARS">
            ARS - Pesos argentinos
          </option>

          <option value="USD">
            USD - Dólares
          </option>
        </select>

        <input
          name="openingHours"
          defaultValue={store?.openingHours || ""}
          placeholder="Horarios de atención"
          className={inputClass}
        />

        <input
          name="expirationAlertDays"
          type="number"
          min="1"
          defaultValue={
            store?.expirationAlertDays || 30
          }
          placeholder="Días alerta vencimiento"
          className={inputClass}
        />

        <input
          name="defaultDeliveryFee"
          type="number"
          min="0"
          step="0.01"
          defaultValue={
            store?.defaultDeliveryFee || 0
          }
          placeholder="Costo default motomandado"
          className={inputClass}
        />

        <div className="md:col-span-2 xl:col-span-4">
          <StoreLogoUpload
            defaultLogoUrl={
              store?.logoUrl || ""
            }
          />
        </div>

        <select
          name="theme"
          defaultValue={store?.theme || "dark"}
          className={inputClass}
        >
          <option value="dark">Modo oscuro</option>
          <option value="light">Modo claro</option>
        </select>

        <button className="min-h-12 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50 md:col-span-2 xl:col-span-4">
          Guardar configuración
        </button>
      </form>

      <div className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-400">
            Restauración
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Restaurar backup
          </h2>

          <p className="mt-2 app-muted">
            Importá un backup previamente
            descargado para restaurar datos
            del comercio.
          </p>
        </div>

        <div className={cardClass}>
          <RestoreBackupForm />
        </div>
      </div>
    </div>
  );
}