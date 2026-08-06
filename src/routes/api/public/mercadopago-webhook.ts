import { createFileRoute } from "@tanstack/react-router";

async function markPaid(paymentId: string) {
  const { mpFetch, getMercadoPagoToken } = await import("@/lib/ebooks.server");
  if (!getMercadoPagoToken()) return;
  const payment = await mpFetch(`/v1/payments/${paymentId}`);
  const orderId = payment?.external_reference;
  if (!orderId) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const status = payment.status === "approved" ? "paid" : payment.status === "rejected" ? "rejected" : "pending";
  await supabaseAdmin
    .from("orders")
    .update({
      status,
      mp_payment_id: String(paymentId),
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", orderId);
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
            await markPaid(String(paymentId));
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