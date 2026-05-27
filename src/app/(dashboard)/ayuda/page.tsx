export default function AyudaPage() {
  const guides = [
    {
      title: "Cómo hacer una venta",
      steps: [
        "Entrá a Ventas.",
        "Buscá o escaneá el producto.",
        "Seleccioná método de pago.",
        "Presioná Finalizar venta.",
        "Imprimí el ticket si hace falta.",
      ],
    },
    {
      title: "Cómo abrir y cerrar caja",
      steps: [
        "Entrá a Caja.",
        "Abrí caja con el monto inicial.",
        "Registrá ingresos o egresos manuales si corresponde.",
        "Al final del día, cargá el monto contado.",
        "Cerrá caja y revisá la diferencia.",
      ],
    },
    {
      title: "Cómo cargar productos",
      steps: [
        "Entrá a Productos.",
        "Completá nombre, precio, stock y código de barras.",
        "Guardá el producto.",
        "Usá ajuste rápido para sumar o restar stock.",
      ],
    },
    {
      title: "Cómo usar fiados",
      steps: [
        "Creá el cliente desde Clientes o desde Ventas.",
        "En una venta, seleccioná método Fiado.",
        "Elegí el cliente.",
        "El sistema suma la deuda automáticamente.",
        "Cuando pague, registrá el pago desde Clientes.",
      ],
    },
    {
      title: "Cómo usar motomandado",
      steps: [
        "Entrá a Envíos.",
        "Cargá cliente, teléfono y dirección.",
        "Solicitá motomandado.",
        "El repartidor lo verá desde su panel mobile.",
        "El estado cambia a tomado, en camino o entregado.",
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-400">Guía rápida</p>
        <h1 className="mt-2 text-3xl font-bold">Ayuda</h1>
        <p className="mt-2 app-muted">
          Instrucciones simples para operar el sistema en el día a día.
        </p>
      </div>

      <div className="grid gap-4">
        {guides.map((guide) => (
          <section
            key={guide.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <h2 className="text-xl font-semibold">{guide.title}</h2>

            <ol className="mt-4 space-y-2 text-white/60">
              {guide.steps.map((step, index) => (
                <li key={step}>
                  <span className="mr-2 text-emerald-400">
                    {index + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}