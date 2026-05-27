import { sendEmail } from "@/lib/email";

export async function sendWelcomeEmail(to: string, storeName: string) {
  await sendEmail({
    to,
    subject: "Bienvenido a Stock Local",
    html: `
      <h1>Bienvenido a Stock Local</h1>
      <p>Tu comercio <strong>${storeName}</strong> ya fue creado.</p>
      <p>Completá el onboarding para empezar a vender, controlar stock y caja.</p>
    `,
  });
}

export async function sendSubscriptionPendingEmail(to: string, plan: string) {
  await sendEmail({
    to,
    subject: "Pago pendiente de confirmación",
    html: `
      <h1>Pago pendiente</h1>
      <p>Recibimos tu solicitud para contratar el plan <strong>${plan}</strong>.</p>
      <p>Tu plan se activará automáticamente cuando Mercado Pago confirme la suscripción.</p>
    `,
  });
}

export async function sendSubscriptionActivatedEmail(to: string, plan: string) {
  await sendEmail({
    to,
    subject: "Suscripción activada",
    html: `
      <h1>Suscripción activada</h1>
      <p>Tu plan <strong>${plan}</strong> ya está activo.</p>
      <p>Ya podés usar las funcionalidades incluidas en tu plan.</p>
    `,
  });
}

export async function sendBackupDownloadedEmail(to: string) {
  await sendEmail({
    to,
    subject: "Backup descargado",
    html: `
      <h1>Backup descargado</h1>
      <p>Se descargó un backup general de tu comercio.</p>
      <p>Si no fuiste vos, revisá la actividad del sistema.</p>
    `,
  });
}

export async function sendBackupRestoredEmail(to: string) {
  await sendEmail({
    to,
    subject: "Backup restaurado",
    html: `
      <h1>Backup restaurado</h1>
      <p>Se restauró un backup en tu comercio.</p>
      <p>Los datos anteriores fueron reemplazados por la información importada.</p>
    `,
  });
}

export async function sendStoreSuspendedEmail(to: string, storeName: string) {
  await sendEmail({
    to,
    subject: "Comercio suspendido",
    html: `
      <h1>Comercio suspendido</h1>
      <p>El comercio <strong>${storeName}</strong> fue suspendido temporalmente.</p>
      <p>Contactá al administrador del sistema para más información.</p>
    `,
  });
}

export async function sendStoreReactivatedEmail(to: string, storeName: string) {
  await sendEmail({
    to,
    subject: "Comercio reactivado",
    html: `
      <h1>Comercio reactivado</h1>
      <p>El comercio <strong>${storeName}</strong> fue reactivado.</p>
      <p>Ya podés volver a usar el sistema normalmente.</p>
    `,
  });
}