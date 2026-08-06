import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export type AdminOverview = {
  totals: { revenue: number; sales: number; monthRevenue: number; monthSales: number };
  perEbook: { id: string; title: string; sales: number; revenue: number }[];
  orders: {
    id: string;
    buyerName: string | null;
    buyerEmail: string;
    ebookTitle: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
  ebooks: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    isPublished: boolean;
    filePath: string | null;
    coverPath: string | null;
    coverUrl: string | null;
  }[];
  mercadoPagoConfigured: boolean;
};

export const getAdminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getMercadoPagoToken, EBOOK_BUCKET } = await import("./ebooks.server");

    const [{ data: orders }, { data: ebooks }] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id, buyer_name, buyer_email, amount, currency, status, created_at, ebook_id, ebooks(title)")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("ebooks")
        .select("id, title, description, price, currency, is_published, file_path, cover_url")
        .order("created_at", { ascending: false }),
    ]);

    const paid = (orders ?? []).filter((o) => o.status === "paid");
    const now = new Date();
    const isThisMonth = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    const perEbookMap = new Map<string, { id: string; title: string; sales: number; revenue: number }>();
    for (const e of ebooks ?? []) {
      perEbookMap.set(e.id, { id: e.id, title: e.title, sales: 0, revenue: 0 });
    }
    for (const o of paid) {
      const entry = perEbookMap.get(o.ebook_id);
      if (entry) {
        entry.sales += 1;
        entry.revenue += Number(o.amount ?? 0);
      }
    }

    const ebooksOut = await Promise.all(
      (ebooks ?? []).map(async (e) => {
        let coverUrl: string | null = null;
        if (e.cover_url) {
          coverUrl = e.cover_url.startsWith("http")
            ? e.cover_url
            : ((
                await supabaseAdmin.storage.from(EBOOK_BUCKET).createSignedUrl(e.cover_url, 60 * 60 * 6)
              ).data?.signedUrl ?? null);
        }
        return {
          id: e.id,
          title: e.title,
          description: e.description ?? "",
          price: Number(e.price ?? 0),
          currency: e.currency ?? "ARS",
          isPublished: e.is_published,
          filePath: e.file_path,
          coverPath: e.cover_url,
          coverUrl,
        };
      }),
    );

    return {
      totals: {
        revenue: paid.reduce((sum, o) => sum + Number(o.amount ?? 0), 0),
        sales: paid.length,
        monthRevenue: paid
          .filter((o) => isThisMonth(o.created_at))
          .reduce((sum, o) => sum + Number(o.amount ?? 0), 0),
        monthSales: paid.filter((o) => isThisMonth(o.created_at)).length,
      },
      perEbook: [...perEbookMap.values()].sort((a, b) => b.revenue - a.revenue),
      orders: (orders ?? []).map((o) => ({
        id: o.id,
        buyerName: o.buyer_name,
        buyerEmail: o.buyer_email,
        ebookTitle: (o.ebooks as { title: string } | null)?.title ?? "—",
        amount: Number(o.amount ?? 0),
        currency: o.currency ?? "ARS",
        status: o.status,
        createdAt: o.created_at,
      })),
      ebooks: ebooksOut,
      mercadoPagoConfigured: Boolean(getMercadoPagoToken()),
    };
  });

export const saveEbook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      title: string;
      description: string;
      price: number;
      currency?: string;
      filePath?: string | null;
      coverPath?: string | null;
      isPublished?: boolean;
    }) => {
      const title = String(input?.title ?? "").trim();
      if (title.length < 2) throw new Error("El título es obligatorio");
      const price = Number(input?.price ?? 0);
      if (!Number.isFinite(price) || price < 0) throw new Error("Precio inválido");
      return {
        id: input.id,
        title,
        description: String(input?.description ?? "").slice(0, 4000),
        price,
        currency: (input.currency ?? "ARS").toUpperCase().slice(0, 5),
        filePath: input.filePath ?? null,
        coverPath: input.coverPath ?? null,
        isPublished: input.isPublished ?? true,
      };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency,
      is_published: data.isPublished,
      ...(data.filePath ? { file_path: data.filePath } : {}),
      ...(data.coverPath ? { cover_url: data.coverPath } : {}),
    };

    if (data.id) {
      const { error } = await supabaseAdmin.from("ebooks").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: created, error } = await supabaseAdmin.from("ebooks").insert(payload).select("id").single();
    if (error) throw error;
    return { id: created.id };
  });

export const deleteEbook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ebooks").update({ is_published: false }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });