import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { Store } from "@/models/Store";

import { mercadoPagoRequest } from "@/lib/mercadopago";
import { verifyMercadoPagoWebhook } from "@/lib/mercadopago-webhook";

import {
  sendSubscriptionActivatedEmail,
} from "@/lib/email-templates";

import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const isValid = verifyMercadoPagoWebhook({
      url: req.url,
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
    });

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Firma inválida",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const preapprovalId =
      body?.data?.id ||
      body?.id ||
      body?.resource
        ?.split("/")
        ?.pop();

    if (!preapprovalId) {
      return NextResponse.json({
        ok: true,
      });
    }

    await connectDB();

    const subscription =
      await mercadoPagoRequest<any>(
        `/preapproval/${preapprovalId}`
      );

    const storeId =
      subscription.external_reference;

    if (!storeId) {
      return NextResponse.json({
        ok: true,
      });
    }

    const statusMap: Record<
      string,
      | "ACTIVE"
      | "PENDING"
      | "PAUSED"
      | "CANCELLED"
    > = {
      authorized: "ACTIVE",
      pending: "PENDING",
      paused: "PAUSED",
      cancelled: "CANCELLED",
    };

    const mappedStatus =
      statusMap[
        subscription.status
      ] || "PENDING";

    const store =
      await Store.findById(
        storeId
      ).populate(
        "owner",
        "email"
      );

    if (!store) {
      return NextResponse.json(
        {
          error:
            "Comercio no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    store.subscription = {
      mercadoPagoPreapprovalId:
        subscription.id,
      status: mappedStatus,
      currentPeriodStart:
        subscription.auto_recurring
          ?.start_date || null,
      currentPeriodEnd:
        subscription.next_payment_date ||
        null,
    };

    if (
      mappedStatus === "ACTIVE"
    ) {
      await createAuditLog({
        store: store._id.toString(),
        user:
          store.owner?.toString?.() ||
          store.owner,
        action:
          "SUBSCRIPTION_ACTIVATED",
        entity: "Store",
        entityId:
          store._id.toString(),
        description: `Suscripción activada (${store.plan})`,
        metadata: {
          preapprovalId:
            subscription.id,
          mercadoPagoStatus:
            subscription.status,
        },
      });

      if (
        (store.owner as any)
          ?.email
      ) {
        await sendSubscriptionActivatedEmail(
          (
            store.owner as any
          ).email,
          store.plan
        );
      }
    }

    if (
      mappedStatus === "PENDING"
    ) {
      await createAuditLog({
        store: store._id.toString(),
        user:
          store.owner?.toString?.() ||
          store.owner,
        action:
          "SUBSCRIPTION_PENDING",
        entity: "Store",
        entityId:
          store._id.toString(),
        description:
          "Suscripción pendiente de confirmación",
        metadata: {
          preapprovalId:
            subscription.id,
          mercadoPagoStatus:
            subscription.status,
        },
      });
    }

    if (
      mappedStatus ===
      "CANCELLED"
    ) {
      store.plan = "FREE";

      await createAuditLog({
        store: store._id.toString(),
        user:
          store.owner?.toString?.() ||
          store.owner,
        action:
          "SUBSCRIPTION_CANCELLED",
        entity: "Store",
        entityId:
          store._id.toString(),
        description:
          "Suscripción cancelada",
        metadata: {
          preapprovalId:
            subscription.id,
          mercadoPagoStatus:
            subscription.status,
        },
      });
    }

    if (
      mappedStatus === "PAUSED"
    ) {
      await createAuditLog({
        store: store._id.toString(),
        user:
          store.owner?.toString?.() ||
          store.owner,
        action:
          "SUBSCRIPTION_PAUSED",
        entity: "Store",
        entityId:
          store._id.toString(),
        description:
          "Suscripción pausada",
        metadata: {
          preapprovalId:
            subscription.id,
          mercadoPagoStatus:
            subscription.status,
        },
      });
    }

    await store.save();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[MP_SUBSCRIPTION_WEBHOOK]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error procesando webhook",
      },
      {
        status: 500,
      }
    );
  }
}