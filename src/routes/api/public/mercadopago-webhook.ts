import { createFileRoute } from "@tanstack/react-router";

async function markPaid(paymentId: string, origin: string) {
  const { mpFetch, getMercadoPagoToken, getPublicClient, getOrderSecret } = await import("@/lib/ebooks.server");
  if (!getMercadoPagoToken()) return;
  const payment = await mpFetch(`/v1/payments/${paymentId}`);
  const orderId = payment?.external_reference;
  if (!orderId) return;

  const status = payment.status === "approved" ? "paid" : payment.status === "rejected" ? "rejected" : "pending";
  // Sin sesión de usuario: se confirma con una función SECURITY DEFINER
  // protegida por una clave privada compartida (no requiere clave de servicio).
  const { error } = await getPublicClient().rpc("confirm_order_payment", {
    _order_id: String(orderId),
    _payment_id: String(paymentId),
    _status: status,
    _secret: getOrderSecret(),
  });
  if (error) {
    console.error("webhook: no se pudo actualizar la orden", error);
    return;
  }

  if (status === "paid") {
    const { deliverPurchaseByEmail } = await import("@/lib/purchase-delivery.server");
    await deliverPurchaseByEmail(String(orderId), origin);
  }
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const raw = await request.text();
          const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          const paymentId =
            (body["data"] as { id?: string } | undefined)?.id ??
            (body["id"] as string | undefined) ??
            url.searchParams.get("data.id") ??
            url.searchParams.get("id");
          const topic = (body["type"] as string) ?? url.searchParams.get("topic") ?? "payment";

          if (paymentId && String(topic).includes("payment")) {
            await markPaid(String(paymentId), url.origin);
          }
          return new Response("ok");
        } catch (error) {
          console.error("mercadopago webhook error", error);
          return new Response("ok");
        }
      },
    },
  },
});