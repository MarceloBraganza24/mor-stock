import Link from "next/link";
import { getSaleTicket } from "@/actions/sale.actions";
import { PrintTicketButton } from "@/components/PrintTicketButton";

type Props = {
  params: Promise<{
    saleId: string;
  }>;
};

export default async function TicketPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await getSaleTicket(saleId);

  const store = sale.store;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 text-white print:bg-white print:p-0 print:text-black">
      <div className="mx-auto max-w-sm app-card-2xl p-5 print:border-none print:bg-white print:p-4">
        <div className="mb-5 text-center">
          {store?.logoUrl && (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="mx-auto mb-3 h-16 w-16 rounded-full object-cover print:h-14 print:w-14"
            />
          )}

          <h1 className="text-xl font-bold">{store?.name || "Comercio"}</h1>

          {store?.address && (
            <p className="text-sm text-white/60 print:text-black">
              {store.address}
            </p>
          )}

          {store?.city && (
            <p className="text-sm text-white/60 print:text-black">
              {store.city}
            </p>
          )}

          {store?.phone && (
            <p className="text-sm text-white/60 print:text-black">
              Tel: {store.phone}
            </p>
          )}
        </div>

        <div className="mb-4 border-y border-dashed border-white/20 py-3 text-sm print:border-black/40">
          <p>Ticket: #{sale._id.slice(-6)}</p>
          <p>
            Fecha:{" "}
            {new Date(sale.createdAt).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>Pago: {sale.paymentMethod}</p>
          <p>Atendió: {sale.user?.name || "-"}</p>
          {sale.customer?.name && <p>Cliente: {sale.customer.name}</p>}
        </div>

        <div className="space-y-3">
          {sale.items.map((item: any) => (
            <div key={`${sale._id}-${item.product}`}>
              <div className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="app-muted print:text-black/70">
                    {item.quantity} x ${item.unitPrice}
                  </p>
                </div>

                <p className="font-semibold">${item.subtotal}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-dashed border-white/20 pt-4 print:border-black/40">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${sale.total}</span>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-white/40 print:text-black/60">
          Gracias por su compra
        </p>

        <div className="mt-6 flex gap-3 print:hidden">
          <PrintTicketButton />

          <Link
            href="/ventas"
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center font-semibold text-white hover:bg-white/10"
          >
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}