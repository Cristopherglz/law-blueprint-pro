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
  const { getPublicClient, EBOOK_BUCKET } = await import("./ebooks.server");
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

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return Promise.all(
    (data ?? []).map(async (row) => {
      let coverUrl: string | null = null;
      if (row.cover_url) {
        if (row.cover_url.startsWith("http")) {
          coverUrl = row.cover_url;
        } else {
          const signed = await supabaseAdmin.storage
            .from(EBOOK_BUCKET)
            .createSignedUrl(row.cover_url, 60 * 60 * 6);
          coverUrl = signed.data?.signedUrl ?? null;
        }
      }
      return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        price: Number(row.price ?? 0),
        currency: row.currency ?? "ARS",
        coverUrl,
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
    const { getMercadoPagoToken, mpFetch } = await import("./ebooks.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: ebook, error } = await supabaseAdmin
      .from("ebooks")
      .select("id, title, description, price, currency, is_published")
      .eq("id", data.ebookId)
      .maybeSingle();
    if (error) throw error;
    if (!ebook || !ebook.is_published) throw new Error("Ebook no disponible");

    if (!getMercadoPagoToken()) {
      return { status: "not_configured" as const };
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        ebook_id: ebook.id,
        buyer_name: data.name,
        buyer_email: data.email,
        amount: ebook.price,
        currency: ebook.currency,
        status: "pending",
      })
      .select("id, download_token")
      .single();
    if (orderError) throw orderError;

    const request = getRequest();
    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/compra-exitosa?token=${order.download_token}`;

    const preference = await mpFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            id: ebook.id,
            title: ebook.title,
            description: (ebook.description ?? "").slice(0, 240) || ebook.title,
            quantity: 1,
            currency_id: ebook.currency ?? "ARS",
            unit_price: Number(ebook.price),
          },
        ],
        payer: { name: data.name, email: data.email },
        external_reference: order.id,
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

    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getMercadoPagoToken, mpFetch, EBOOK_BUCKET } = await import("./ebooks.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, buyer_name, ebook_id, ebooks(title, file_path)")
      .eq("download_token", data.token)
      .maybeSingle();
    if (error) throw error;
    if (!order) return { status: "not_found" as const };

    let status = order.status;

    // Fallback in case the webhook has not arrived yet.
    if (status !== "paid" && data.paymentId && getMercadoPagoToken()) {
      try {
        const payment = await mpFetch(`/v1/payments/${data.paymentId}`);
        if (payment?.status === "approved") {
          status = "paid";
          await supabaseAdmin
            .from("orders")
            .update({ status: "paid", paid_at: new Date().toISOString(), mp_payment_id: String(data.paymentId) })
            .eq("id", order.id);
        }
      } catch (mpError) {
        console.error("payment verification failed", mpError);
      }
    }

    const ebook = order.ebooks as { title: string; file_path: string | null } | null;
    let downloadUrl: string | null = null;
    if (status === "paid" && ebook?.file_path) {
      const signed = await supabaseAdmin.storage
        .from(EBOOK_BUCKET)
        .createSignedUrl(ebook.file_path, 60 * 60);
      downloadUrl = signed.data?.signedUrl ?? null;
    }

    return {
      status: status === "paid" ? ("paid" as const) : ("pending" as const),
      buyerName: order.buyer_name,
      ebookTitle: ebook?.title ?? "",
      downloadUrl,
    };
  });