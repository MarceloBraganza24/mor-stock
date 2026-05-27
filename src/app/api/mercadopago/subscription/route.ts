import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { mercadoPagoRequest } from "@/lib/mercadopago";
import { verifyMercadoPagoWebhook } from "@/lib/mercadopago-webhook";
import { sendSubscriptionActivatedEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const isValid = verifyMercadoPagoWebhook({
    url: req.url,
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
  });

  if (!isValid) {
    return NextResponse.json(
      { error: "Firma inválida" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const preapprovalId =
    body?.data?.id || body?.id || body?.resource?.split("/")?.pop();

  if (!preapprovalId) {
    return NextResponse.json({ ok: true });
  }

  await connectDB();

  const subscription = await mercadoPagoRequest<any>(
    `/preapproval/${preapprovalId}`
  );

  const storeId = subscription.external_reference;

  if (!storeId) {
    return NextResponse.json({ ok: true });
  }

  const mappedStatus: Record<string, "ACTIVE" | "PENDING" | "PAUSED" | "CANCELLED"> = {
    authorized: "ACTIVE",
    pending: "PENDING",
    paused: "PAUSED",
    cancelled: "CANCELLED",
  };

  const update: any = {
    "subscription.mercadoPagoPreapprovalId": subscription.id,
    "subscription.status": mappedStatus,
  };

  if (mappedStatus !== "ACTIVE") {
    update.plan = "FREE";
  }

  const store = await Store.findById(storeId).populate("owner", "email");

  if (mappedStatus === "ACTIVE" && store?.owner?.email) {
    await sendSubscriptionActivatedEmail(store.owner.email, store.plan);
  }

  await Store.findByIdAndUpdate(storeId, update);

  await Store.findByIdAndUpdate(storeId, {
    "subscription.mercadoPagoPreapprovalId": subscription.id,
    "subscription.status": mappedStatus,
    plan: mappedStatus === "ACTIVE" ? undefined : "FREE",
  });

  return NextResponse.json({ ok: true });
}