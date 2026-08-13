import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export type PublicEbook = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverUrl: string | null;
  hasFile: boolean;
};

export const listEbooks = createServerFn({ method: "GET" }).handler(async (): Promise<PublicEbook[]> => {
  const { getPublicClient, resolveCoverUrl } = await import("./ebooks.server");
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("ebooks")
    .select("id, title, description, price, currency, cover_url, file_path")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listEbooks failed", error);
    return [];
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        price: Number(row.price ?? 0),
        currency: row.currency ?? "ARS",
        coverUrl: await resolveCoverUrl(row.cover_url),
        hasFile: Boolean(row.file_path),
      };
    }),
  );
});

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { ebookId: string; name: string; email: string }) => {
    const email = String(input?.email ?? "").trim();
    const name = String(input?.name ?? "").trim();
    const ebookId = String(input?.ebookId ?? "").trim();
    if (!ebookId) throw new Error("Falta el ebook");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Email inválido");
    if (name.length < 2 || name.length > 120) throw new Error("Nombre inválido");
    return { ebookId, name, email: email.toLowerCase() };
  })
  .handler(async ({ data }) => {
    const { getMercadoPagoToken, mpFetch, getPublicClient, getOrderSecret } = await import("./ebooks.server");
    const supabase = getPublicClient();

    if (!getMercadoPagoToken()) {
      return { status: "not_configured" as const };
    }

    // La orden se crea con una función SECURITY DEFINER: no hace falta clave de servicio.
    const { data: created, error: orderError } = await supabase.rpc("create_order", {
      _ebook_id: data.ebookId,
      _buyer_name: data.name,
      _buyer_email: data.email,
    });
    if (orderError) throw new Error(orderError.message);
    const order = created?.[0];
    if (!order) throw new Error("No pudimos registrar la compra");

    const request = getRequest();
    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/compra-exitosa?token=${order.order_token}`;

    const preference = await mpFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            id: data.ebookId,
            title: order.ebook_title,
            description: (order.ebook_description ?? "").slice(0, 240) || order.ebook_title,
            quantity: 1,
            currency_id: order.order_currency ?? "ARS",
            unit_price: Number(order.order_amount),
          },
        ],
        payer: { name: data.name, email: data.email },
        external_reference: order.order_id,
        back_urls: {
          success: successUrl,
          pending: successUrl,
          failure: `${origin}/biblioteca?pago=fallido`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/public/mercadopago-webhook`,
        statement_descriptor: "EBOOK ABG GONZALEZ",
      }),
    });

    const { error: prefError } = await supabase.rpc("set_order_preference", {
      _order_id: order.order_id,
      _preference_id: String(preference.id),
      _secret: getOrderSecret(),
    });
    if (prefError) console.error("no se pudo guardar la preferencia", prefError);

    return {
      status: "ready" as const,
      checkoutUrl: (preference.init_point ?? preference.sandbox_init_point) as string,
    };
  });

export const getPurchase = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; paymentId?: string }) => ({
    token: String(input?.token ?? "").trim(),
    paymentId: input?.paymentId ? String(input.paymentId) : undefined,
  }))
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Falta el identificador de la compra");
    const { getMercadoPagoToken, mpFetch, getPublicClient, getOrderSecret } = await import("./ebooks.server");
    const supabase = getPublicClient();

    const { data: rows, error } = await supabase.rpc("get_purchase_by_token", { _token: data.token });
    if (error) throw new Error(error.message);
    const order = rows?.[0];
    if (!order) return { status: "not_found" as const };

    let status = order.status;
    let hasFile = order.has_file;

    // Fallback in case the webhook has not arrived yet.
    if (status !== "paid" && data.paymentId && getMercadoPagoToken()) {
      try {
        const payment = await mpFetch(`/v1/payments/${data.paymentId}`);
        if (payment?.status === "approved") {
          const { data: confirmed, error: confirmError } = await supabase.rpc("confirm_order_payment", {
            _order_id: order.id,
            _payment_id: String(data.paymentId),
            _status: "paid",
            _secret: getOrderSecret(),
          });
          if (confirmError) throw new Error(confirmError.message);
          status = "paid";
          hasFile = confirmed?.[0]?.has_file ?? hasFile;
          try {
            const { deliverPurchaseByEmail } = await import("./purchase-delivery.server");
            await deliverPurchaseByEmail(order.id, new URL(getRequest().url).origin);
          } catch (mailError) {
            console.error("no se pudo enviar el email de descarga", mailError);
          }
        }
      } catch (mpError) {
        console.error("payment verification failed", mpError);
      }
    }

    return {
      status: status === "paid" ? ("paid" as const) : ("pending" as const),
      buyerName: order.buyer_name,
      ebookTitle: order.ebook_title ?? "",
      downloadUrl: status === "paid" && hasFile ? `/api/public/descargar?token=${data.token}` : null,
    };
  });