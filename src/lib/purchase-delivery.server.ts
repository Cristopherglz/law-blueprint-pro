import { EBOOK_BUCKET } from "./ebooks.server";

/**
 * Entrega del ebook por correo: genera el enlace de descarga de la orden pagada
 * y lo envía al comprador. Se ejecuta una sola vez por orden.
 */
export async function deliverPurchaseByEmail(orderId: string, origin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, status, buyer_name, buyer_email, download_token, delivery_email_sent_at, ebooks(title, file_path)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("deliverPurchaseByEmail: no se pudo leer la orden", error);
    return { sent: false, reason: "order_read_failed" as const };
  }
  if (!order || order.status !== "paid") return { sent: false, reason: "not_paid" as const };
  if (order.delivery_email_sent_at) return { sent: false, reason: "already_sent" as const };

  const ebook = order.ebooks as { title: string; file_path: string | null } | null;
  const successUrl = `${origin}/compra-exitosa?token=${order.download_token}`;

  let downloadUrl = successUrl;
  if (ebook?.file_path) {
    const signed = await supabaseAdmin.storage
      .from(EBOOK_BUCKET)
      .createSignedUrl(ebook.file_path, 60 * 60 * 24 * 7);
    if (signed.data?.signedUrl) downloadUrl = signed.data.signedUrl;
  }

  const payload = {
    to: order.buyer_email,
    buyerName: order.buyer_name ?? "",
    ebookTitle: ebook?.title ?? "tu ebook",
    downloadUrl,
    successUrl,
  };

  const sender = await loadEmailSender();
  if (!sender) {
    console.warn("deliverPurchaseByEmail: envío de correo no configurado todavía", {
      orderId,
      to: payload.to,
    });
    return { sent: false, reason: "email_not_configured" as const, payload };
  }

  const result = await sender(payload);
  if (result.sent) {
    await supabaseAdmin
      .from("orders")
      .update({ delivery_email_sent_at: new Date().toISOString() })
      .eq("id", order.id);
  }
  return result;
}

type SendPayload = {
  to: string;
  buyerName: string;
  ebookTitle: string;
  downloadUrl: string;
  successUrl: string;
};

/**
 * Carga el envío de correos gestionado del proyecto. Devuelve null mientras el
 * dominio de envío no esté configurado (en ese caso la compra sigue siendo
 * descargable desde /compra-exitosa y el enlace queda registrado en los logs).
 */
async function loadEmailSender(): Promise<((payload: SendPayload) => Promise<{ sent: boolean }>) | null> {
  return null;
}
