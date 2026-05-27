"use server";

import { redirect } from "next/navigation";
import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { mercadoPagoRequest } from "@/lib/mercadopago";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

const planPrices = {
  BASIC: 15,
  PRO: 30,
};

const planNames = {
  BASIC: "Plan Básico - Stock Local",
  PRO: "Plan Pro - Stock Local",
};

export async function cancelSubscription() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = await Store.findOne({
    _id: session.user.store,
    owner: session.user.id,
  });

  if (!store) {
    throw new Error("Comercio no encontrado");
  }

  const preapprovalId = store.subscription?.mercadoPagoPreapprovalId;

  if (!preapprovalId) {
    throw new Error("No hay suscripción activa para cancelar");
  }

  await mercadoPagoRequest(`/preapproval/${preapprovalId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "cancelled",
    }),
  });

  store.plan = "FREE";
  store.subscription = {
    mercadoPagoPreapprovalId: preapprovalId,
    status: "CANCELLED",
    currentPeriodStart: null,
    currentPeriodEnd: null,
  };

  await store.save();

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "CANCEL_SUBSCRIPTION",
    entity: "Store",
    entityId: store._id.toString(),
    description: "Canceló suscripción",
  });

  revalidatePath("/planes");
}

export async function createSubscriptionCheckout(plan: "BASIC" | "PRO") {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const store = await Store.findOne({
    _id: session.user.store,
    owner: session.user.id,
  }).populate("owner", "email");

  if (!store) {
    throw new Error("Comercio no encontrado");
  }

  const ownerEmail = (store.owner as any)?.email;

  if (!ownerEmail) {
    throw new Error("El dueño no tiene email asociado");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const subscription = await mercadoPagoRequest<{
    id: string;
    init_point: string;
  }>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: planNames[plan],
      external_reference: String(store._id),
      payer_email: ownerEmail,
      back_url: `${appUrl}/pago-pendiente`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: planPrices[plan],
        currency_id: "USD",
      },
      status: "pending",
    }),
  });

  store.plan = plan;
  store.subscription = {
    mercadoPagoPreapprovalId: subscription.id,
    status: "PENDING",
    currentPeriodStart: null,
    currentPeriodEnd: null,
  };

  await store.save();

  await createAuditLog({
    store: session.user.store,
    user: session.user.id,
    action: "CREATE_SUBSCRIPTION_CHECKOUT",
    entity: "Store",
    entityId: store._id.toString(),
    description: `Inició checkout para plan ${plan}`,
  });

  redirect(subscription.init_point);
}