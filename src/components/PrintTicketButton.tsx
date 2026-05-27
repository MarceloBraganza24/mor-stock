"use client";

export function PrintTicketButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-black px-4 py-2 text-white"
    >
      Imprimir ticket
    </button>
  );
}