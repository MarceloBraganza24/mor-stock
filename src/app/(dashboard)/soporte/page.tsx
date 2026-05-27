import Link from "next/link";
import { Mail, MessageCircle, LifeBuoy } from "lucide-react";

export default function SoportePage() {
  const whatsapp = "https://wa.me/5492926457583?text=Hola,%20necesito%20soporte%20con%20Stock%20Local";

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Ayuda</p>
        <h1 className="mt-2 text-3xl font-bold">Soporte</h1>
        <p className="mt-2 app-muted">
          Contactá soporte o reportá un problema del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <a
          href={whatsapp}
          target="_blank"
          className="app-card-2xl p-5 hover:bg-white/[0.06]"
        >
          <MessageCircle className="text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold">WhatsApp</h2>
          <p className="mt-2 app-muted">Contactar soporte rápido.</p>
        </a>

        <a
          href="mailto:soporte@stocklocal.app"
          className="app-card-2xl p-5 hover:bg-white/[0.06]"
        >
          <Mail className="text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold">Email</h2>
          <p className="mt-2 app-muted">Enviar consulta por correo.</p>
        </a>

        <a
          href="https://wa.me/5492926457583?text=Hola,%20te%20dejo%20feedback%20sobre%20Stock%20Local:%20"
          target="_blank"
          className="app-card-2xl p-5 hover:bg-white/[0.06]"
        >
          <LifeBuoy className="text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold">Enviar feedback</h2>
          <p className="mt-2 app-muted">
            Mandar una idea, problema o mejora por WhatsApp.
          </p>
        </a>

        <Link
          href="/ayuda"
          className="app-card-2xl p-5 hover:bg-white/[0.06]"
        >
          <LifeBuoy className="text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold">Centro de ayuda</h2>
          <p className="mt-2 app-muted">Ver guías rápidas de uso.</p>
        </Link>
      </div>
    </div>
  );
}