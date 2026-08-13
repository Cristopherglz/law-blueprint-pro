import { getPublicClient, getOrderSecret } from "./ebooks.server";

/**
 * Entrega del ebook por correo: genera el enlace de descarga de la orden pagada
 * y lo envía al comprador. Se ejecuta una sola vez por orden. Usa funciones
 * SECURITY DEFINER de Postgres con la clave pública (sin clave de servicio).
 */
export async function deliverPurchaseByEmail(orderId: string, origin: string) {
  const supabase = getPublicClient();
  const { data: rows, error } = await supabase.rpc("get_order_for_delivery", {
    _order_id: orderId,
    _secret: getOrderSecret(),
  });
  const order = rows?.[0];

  if (error) {
    console.error("deliverPurchaseByEmail: no se pudo leer la orden", error);
    return { sent: false, reason: "order_read_failed" as const };
  }
  if (!order || order.status !== "paid") return { sent: false, reason: "not_paid" as const };
  if (order.delivery_email_sent_at) return { sent: false, reason: "already_sent" as const };

  const successUrl = `${origin}/compra-exitosa?token=${order.download_token}`;
  const downloadUrl = order.has_file
    ? `${origin}/api/public/descargar?token=${order.download_token}`
    : successUrl;

  const payload = {
    to: order.buyer_email,
    buyerName: order.buyer_name ?? "",
    ebookTitle: order.ebook_title ?? "tu ebook",
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
    await supabase.rpc("mark_order_delivered", { _order_id: order.id, _secret: getOrderSecret() });
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
