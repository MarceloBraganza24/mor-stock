"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sale.actions";
import { createCustomer } from "@/actions/customer.actions";

type Product = {
  _id: string;
  name: string;
  barcode?: string;
  salePrice: number;
  stock: number;
};

type Customer = {
  _id: string;
  name: string;
  balance: number;
};

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};

type PaymentMethod =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEBITO"
  | "CREDITO"
  | "QR"
  | "FIADO";

export function SalesPoint({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("EFECTIVO");
  const [customerId, setCustomerId] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [message, setMessage] = useState("");
  const [scannerMode, setScannerMode] = useState(true);
  const [showQuickProduct, setShowQuickProduct] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (scannerMode) {
      searchInputRef.current?.focus();
    }
  }, [scannerMode, cart.length]);

  const filteredProducts = useMemo(() => {
    const value = query.toLowerCase().trim();

    if (!value) return products.slice(0, 10);

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(value) ||
          product.barcode?.includes(value)
        );
      })
      .slice(0, 12);
  }, [products, query]);

  const total = cart.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  function playSuccessSound() {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );

    audio.volume = 0.3;
    audio.play().catch(() => {});
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      setMessage(`Sin stock para ${product.name}`);
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product._id);

      if (exists) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
          unitPrice: product.salePrice,
          stock: product.stock,
        },
      ];
    });

    playSuccessSound();
    setMessage(`Producto agregado: ${product.name}`);
    setQuery("");
  }

  function handleBarcodeScan(value: string) {
    const code = value.trim();

    if (!code) return;

    const exactProduct = products.find(
      (product) => product.barcode && product.barcode.trim() === code
    );

    if (exactProduct) {
      addToCart(exactProduct);
      return;
    }

    setUnknownBarcode(code);
    setShowQuickProduct(true);
    setMessage(`No existe un producto con el código: ${code}`);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const value = query.trim();

    if (!value) return;

    const exactByBarcode = products.find(
      (product) => product.barcode && product.barcode.trim() === value
    );

    if (exactByBarcode) {
      addToCart(exactByBarcode);
      return;
    }

    if (filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      return;
    }

    handleBarcodeScan(value);
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function finishSale() {
    setMessage("");

    startTransition(async () => {
      const result = await createSale({
        paymentMethod,
        customerId: paymentMethod === "FIADO" ? customerId : undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (result?.error) {
        setMessage(result.error);
        return;
      }

      setCart([]);
      setCustomerId("");
      setMessage("Venta registrada correctamente.");
      router.refresh();
    });
  }

  async function openCameraScanner() {
    setMessage("");

    if (!("BarcodeDetector" in window)) {
      setMessage(
        "Este navegador no soporta escaneo por cámara nativo. Probalo en Chrome Android o agregamos librería ZXing."
      );
      return;
    }

    setCameraOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const detector = new BarcodeDetectorClass({
      formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"],
    });

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const barcodes = await detector.detect(videoRef.current);

      if (barcodes.length > 0) {
        const value = barcodes[0].rawValue;
        closeCameraScanner();
        handleBarcodeScan(value);
      }
    }, 700);
  }

  function closeCameraScanner() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    const stream = videoRef.current?.srcObject as MediaStream | null;

    stream?.getTracks().forEach((track) => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold sm:text-xl">Buscar producto</h2>
          <p className="text-sm text-white/40">
            Escaneá código, buscá por nombre o tocá un producto.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar o escanear código"
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-4 text-base outline-none focus:border-emerald-500"
          />

          <button
            type="button"
            onClick={() => setScannerMode((prev) => !prev)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              scannerMode
                ? "bg-emerald-500 text-neutral-950"
                : "bg-white/10 text-white"
            }`}
          >
            {scannerMode ? "Scanner activo" : "Activar scanner"}
          </button>

          <button
            type="button"
            onClick={openCameraScanner}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
          >
            Cámara
          </button>
        </div>

        {cameraOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-4">
            <video
              ref={videoRef}
              className="aspect-video w-full rounded-xl bg-black object-cover"
              muted
              playsInline
            />

            <button
              type="button"
              onClick={closeCameraScanner}
              className="mt-3 w-full rounded-xl bg-red-500 py-3 font-semibold text-white"
            >
              Cerrar cámara
            </button>
          </div>
        )}

        {showQuickProduct && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="font-semibold text-red-300">
              Código no registrado: {unknownBarcode}
            </p>

            <p className="mt-1 text-sm text-white/60">
              Cargalo rápido en productos y después volvé a escanear.
            </p>

            <a
              href={`/productos?query=${unknownBarcode}&from=ventas`}
              className="mt-3 inline-flex rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Cargar producto nuevo
            </a>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    Stock: {product.stock}
                    {product.barcode ? ` · ${product.barcode}` : ""}
                  </p>
                </div>

                <p className="shrink-0 text-lg font-bold text-emerald-400">
                  ${product.salePrice}
                </p>
              </div>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40 sm:col-span-2 xl:col-span-1 2xl:col-span-2">
              No se encontraron productos.
            </p>
          )}
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-emerald-400">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 xl:sticky xl:top-24 xl:self-start">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Venta actual</h2>
            <p className="text-sm text-white/40">{cart.length} productos</p>
          </div>

          <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-lg font-bold text-emerald-400">
            ${total}
          </p>
        </div>

        <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="rounded-xl border border-white/10 bg-neutral-900 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-sm text-white/50">${item.unitPrice} c/u</p>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="shrink-0 text-sm text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="bg-neutral-950 px-3 py-2 text-lg"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 bg-neutral-950 px-2 py-2 text-center outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="bg-neutral-950 px-3 py-2 text-lg"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold">${item.quantity * item.unitPrice}</p>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/40">
              Todavía no agregaste productos.
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm text-white/50">Método de pago</label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-4 text-base outline-none focus:border-emerald-500"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="QR">QR</option>
            <option value="FIADO">Fiado</option>
          </select>
        </div>

        {paymentMethod === "FIADO" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-white/50">Cliente</label>

              <button
                type="button"
                onClick={() => setShowNewCustomer((prev) => !prev)}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                + Crear cliente
              </button>
            </div>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-4 text-base outline-none focus:border-emerald-500"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - debe ${customer.balance}
                </option>
              ))}
            </select>

            {showNewCustomer && (
              <form
                action={async (formData) => {
                  await createCustomer(formData);
                  setShowNewCustomer(false);
                  setMessage("Cliente creado. Ya podés seleccionarlo.");
                  router.refresh();
                }}
                className="mt-4 grid gap-3"
              >
                <input
                  name="name"
                  placeholder="Nombre del cliente"
                  required
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="phone"
                  placeholder="Teléfono"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="notes"
                  placeholder="Notas"
                  className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-3 outline-none focus:border-emerald-500"
                />

                <button className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400">
                  Guardar cliente
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-white/60">Total</p>
            <p className="text-3xl font-bold">${total}</p>
          </div>

          <button
            onClick={finishSale}
            disabled={cart.length === 0 || isPending}
            className="mt-5 w-full rounded-xl bg-emerald-500 py-4 text-base font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Registrando..." : "Finalizar venta"}
          </button>
        </div>
      </section>
    </div>
  );
}