import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, LogOut, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminOverview, saveEbook, deleteEbook } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPanel,
  head: () => ({
    meta: [
      { title: "Panel de control | Abg. Cristopher González" },
      { name: "description", content: "Panel privado: ventas de ebooks, ganancias y gestión de productos." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Panel de control" },
      { property: "og:description", content: "Ventas de ebooks, ganancias y gestión de productos." },
    ],
  }),
});

const money = (value: number, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const saveFn = useServerFn(saveEbook);
  const deleteFn = useServerFn(deleteEbook);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({ data: undefined as never }),
  });

  const [form, setForm] = useState({ title: "", description: "", price: "", currency: "ARS" });
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(target: File, folder: string) {
    const path = `${folder}/${crypto.randomUUID()}-${target.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("ebook-files").upload(path, target);
    if (uploadError) throw uploadError;
    return path;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const filePath = file ? await upload(file, "files") : null;
      const coverPath = cover ? await upload(cover, "covers") : null;
      await saveFn({
        data: {
          title: form.title,
          description: form.description,
          price: Number(form.price || 0),
          currency: form.currency,
          filePath,
          coverPath,
          isPublished: true,
        },
      });
      setForm({ title: "", description: "", price: "", currency: "ARS" });
      setFile(null);
      setCover(null);
      setMessage("Ebook publicado correctamente.");
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo guardar el ebook.");
    } finally {
      setSaving(false);
    }
  }

  async function onSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-legal-dark text-primary-foreground">
        <div className="container-legal flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" strokeWidth={1.4} />
            <h1 className="font-display text-2xl">Panel de control</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-4 py-2 font-body text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 bg-primary-foreground text-foreground px-4 py-2 font-body text-sm"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container-legal py-10 space-y-10">
        {isLoading && <p className="font-body text-sm text-muted-foreground">Cargando datos…</p>}
        {error && (
          <p className="font-body text-sm text-destructive">
            No se pudieron cargar los datos. ¿La cuenta tiene permisos de administrador?
          </p>
        )}

        {data && (
          <>
            {!data.mercadoPagoConfigured && (
              <div className="border border-border bg-background p-5 font-body text-sm">
                <strong>Mercado Pago todavía no está conectado.</strong> Los ebooks se muestran en la web,
                pero el botón de pago avisará que el cobro aún no está disponible. Al cargar el Access Token
                queda activo automáticamente.
              </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Ganancias totales", value: money(data.totals.revenue) },
                { label: "Ganancias del mes", value: money(data.totals.monthRevenue) },
                { label: "Ebooks vendidos", value: String(data.totals.sales) },
                { label: "Ventas del mes", value: String(data.totals.monthSales) },
              ].map((card) => (
                <div key={card.label} className="bg-background border border-border p-6">
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="font-display text-3xl mt-3">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="bg-background border border-border p-6">
              <h2 className="font-display text-2xl mb-5">Ganancias por ebook</h2>
              <div className="overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead className="text-muted-foreground text-xs uppercase tracking-widest">
                    <tr>
                      <th className="text-left py-2">Ebook</th>
                      <th className="text-right py-2">Vendidos</th>
                      <th className="text-right py-2">Ganancias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perEbook.map((row) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="py-3">{row.title}</td>
                        <td className="py-3 text-right">{row.sales}</td>
                        <td className="py-3 text-right">{money(row.revenue)}</td>
                      </tr>
                    ))}
                    {data.perEbook.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-muted-foreground">
                          Todavía no hay ebooks cargados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-background border border-border p-6">
              <h2 className="font-display text-2xl mb-5">Compras</h2>
              <div className="overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead className="text-muted-foreground text-xs uppercase tracking-widest">
                    <tr>
                      <th className="text-left py-2">Fecha</th>
                      <th className="text-left py-2">Comprador</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Ebook</th>
                      <th className="text-right py-2">Monto</th>
                      <th className="text-right py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => (
                      <tr key={order.id} className="border-t border-border">
                        <td className="py-3">{new Date(order.createdAt).toLocaleDateString("es-AR")}</td>
                        <td className="py-3">{order.buyerName ?? "—"}</td>
                        <td className="py-3">{order.buyerEmail}</td>
                        <td className="py-3">{order.ebookTitle}</td>
                        <td className="py-3 text-right">{money(order.amount, order.currency)}</td>
                        <td className="py-3 text-right">
                          {order.status === "paid" ? "Pagado" : order.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </td>
                      </tr>
                    ))}
                    {data.orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-muted-foreground">
                          Todavía no hay compras registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-background border border-border p-6">
              <h2 className="font-display text-2xl mb-5">Subir un nuevo ebook</h2>
              <form onSubmit={onCreate} className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Título del producto
                  </span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-2 w-full border border-border px-4 py-3 font-body text-sm"
                  />
                </label>
                <label className="block">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Precio (ARS)
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-2 w-full border border-border px-4 py-3 font-body text-sm"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Descripción
                  </span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-2 w-full border border-border px-4 py-3 font-body text-sm"
                  />
                </label>
                <label className="block">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Archivo del ebook (PDF)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.epub"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-2 w-full border border-border px-4 py-3 font-body text-sm"
                  />
                </label>
                <label className="block">
                  <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                    Portada (imagen)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                    className="mt-2 w-full border border-border px-4 py-3 font-body text-sm"
                  />
                </label>
                <div className="lg:col-span-2 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-body text-sm font-medium disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" /> {saving ? "Guardando…" : "Publicar ebook"}
                  </button>
                  {message && <span className="font-body text-sm text-muted-foreground">{message}</span>}
                </div>
              </form>
            </section>

            <section className="bg-background border border-border p-6">
              <h2 className="font-display text-2xl mb-5">Ebooks publicados</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.ebooks.map((ebook) => (
                  <article key={ebook.id} className="border border-border p-5">
                    {ebook.coverUrl && (
                      <img src={ebook.coverUrl} alt={ebook.title} className="w-full h-40 object-contain mb-4" />
                    )}
                    <h3 className="font-display text-lg">{ebook.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      {money(ebook.price, ebook.currency)} · {ebook.isPublished ? "Publicado" : "Oculto"}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-3">
                      {ebook.description}
                    </p>
                    {ebook.isPublished && (
                      <button
                        onClick={async () => {
                          await deleteFn({ data: { id: ebook.id } });
                          await refetch();
                        }}
                        className="mt-4 font-body text-xs uppercase tracking-widest text-destructive"
                      >
                        Ocultar de la web
                      </button>
                    )}
                  </article>
                ))}
                {data.ebooks.length === 0 && (
                  <p className="font-body text-sm text-muted-foreground">Todavía no cargaste ebooks.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}