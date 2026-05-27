import crypto from "crypto";

export function verifyMercadoPagoWebhook({
  url,
  xSignature,
  xRequestId,
}: {
  url: string;
  xSignature: string | null;
  xRequestId: string | null;
}) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Falta MERCADOPAGO_WEBHOOK_SECRET");
  }

  if (!xSignature || !xRequestId) {
    return false;
  }

  const searchParams = new URL(url).searchParams;
  const dataId = searchParams.get("data.id");

  if (!dataId) {
    return false;
  }

  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key?.trim() === "ts") ts = value?.trim();
    if (key?.trim() === "v1") hash = value?.trim();
  }

  if (!ts || !hash) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(hash)
  );
}