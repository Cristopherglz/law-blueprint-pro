import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  BookOpen,
  LogOut,
  Plus,
  RefreshCw,
  LayoutDashboard,
  Receipt,
  Library,
  TrendingUp,
  Wallet,
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  EyeOff,
  X,
} from "lucide-react";
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

type Tab = "resumen" | "ventas" | "catalogo";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "ventas", label: "Ventas", icon: Receipt },
  { id: "catalogo", label: "Catálogo", icon: Library },
];

const emptyForm = { id: "", title: "", description: "", price: "", currency: "ARS" };

function StatusPill({ status }: { status: string }) {
  const label = status === "paid" ? "Pagado" : status === "rejected" ? "Rechazado" : "Pendiente";
  const tone =
    status === "paid"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : status === "rejected"
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const saveFn = useServerFn(saveEbook);
  const deleteFn = useServerFn(deleteEbook);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({ data: undefined as never }),
  });

  const [tab, setTab] = useState<Tab>("resumen");
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const bestSeller = useMemo(
    () => data?.perEbook.find((row) => row.sales > 0) ?? null,
    [data],
  );

  async function upload(target: File, folder: string) {
    const path = `${folder}/${crypto.randomUUID()}-${target.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("ebook-files").upload(path, target);
    if (uploadError) throw uploadError;
    return path;
  }

  function startEdit(ebook: NonNullable<typeof data>["ebooks"][number]) {
    setForm({
      id: ebook.id,
      title: ebook.title,
      description: ebook.description,
      price: String(ebook.price),
      currency: ebook.currency,
    });
    setFile(null);
    setCover(null);
    setMessage(null);
    setFormOpen(true);
    setTab("catalogo");
  }

  function resetForm() {
    setForm(emptyForm);
    setFile(null);
    setCover(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const filePath = file ? await upload(file, "files") : null;
      const coverPath = cover ? await upload(cover, "covers") : null;
      await saveFn({
        data: {
          ...(form.id ? { id: form.id } : {}),
          title: form.title,
          description: form.description,
          price: Number(form.price || 0),
          currency: form.currency,
          filePath,
          coverPath,
          isPublished: true,
        },
      });
      resetForm();
      setFormOpen(false);
      setMessage({ tone: "ok", text: form.id ? "Ebook actualizado." : "Ebook publicado correctamente." });
      await refetch();
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "No se pudo guardar el ebook.",
      });
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

  const stats = data
    ? [
        { label: "Ganancias totales", value: money(data.totals.revenue), icon: Wallet },
        { label: "Ganancias del mes", value: money(data.totals.monthRevenue), icon: TrendingUp },
        { label: "Ebooks vendidos", value: String(data.totals.sales), icon: ShoppingBag },
        { label: "Ventas del mes", value: String(data.totals.monthSales), icon: CalendarDays },
      ]
    : [];

  return (
    <div className="min-h-screen bg-secondary/60">
      <header className="sticky top-0 z-30 bg-legal-dark/95 backdrop-blur text-primary-foreground border-b border-primary-foreground/10">
        <div className="container-legal flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
              <BookOpen className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="font-display text-xl leading-tight">Panel de control</h1>
              <p className="font-body text-xs text-primary-foreground/60">Ebooks · ventas · ganancias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-4 py-2 font-body text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} /> Actualizar
            </button>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground text-foreground px-4 py-2 font-body text-sm hover:opacity-90 transition-opacity"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
        <div className="container-legal">
          <nav className="flex gap-1 -mb-px">
            {TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 font-body text-sm border-b-2 transition-colors ${
                  tab === item.id
                    ? "border-primary-foreground text-primary-foreground"
                    : "border-transparent text-primary-foreground/60 hover:text-primary-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container-legal py-10 space-y-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-background/70 border border-border" />
            ))}
          </div>
        )}
        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 font-body text-sm text-destructive">
            No se pudieron cargar los datos. ¿La cuenta tiene permisos de administrador?
          </p>
        )}

        {message && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 font-body text-sm ${
              message.tone === "ok"
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            {message.text}
          </div>
        )}

        {data && (
          <>
            {!data.mercadoPagoConfigured && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 font-body text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
                <span>
                  <strong>Mercado Pago todavía no está conectado.</strong> Los ebooks se muestran en la web,
                  pero el botón de pago avisará que el cobro aún no está disponible.
                </span>
              </div>
            )}

            {tab === "resumen" && (
              <>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl bg-background border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                          {card.label}
                        </p>
                        <card.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
                      </div>
                      <p className="font-display text-3xl mt-4">{card.value}</p>
                    </div>
                  ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-2xl bg-background border border-border p-6 shadow-sm">
                    <h2 className="font-display text-xl mb-5">Ganancias por ebook</h2>
                    <div className="space-y-4">
                      {data.perEbook.map((row) => {
                        const max = Math.max(...data.perEbook.map((r) => r.revenue), 1);
                        return (
                          <div key={row.id}>
                            <div className="flex items-baseline justify-between font-body text-sm">
                              <span className="truncate pr-4">{row.title}</span>
                              <span className="shrink-0 text-muted-foreground">
                                {row.sales} · {money(row.revenue)}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-secondary">
                              <div
                                className="h-1.5 rounded-full bg-foreground/80"
                                style={{ width: `${Math.max((row.revenue / max) * 100, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {data.perEbook.length === 0 && (
                        <p className="font-body text-sm text-muted-foreground">
                          Todavía no hay ebooks cargados.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-legal-dark text-primary-foreground p-6 shadow-sm">
                    <p className="font-body text-xs uppercase tracking-widest text-primary-foreground/60">
                      Más vendido
                    </p>
                    <p className="font-display text-2xl mt-4 leading-tight">
                      {bestSeller ? bestSeller.title : "Sin ventas aún"}
                    </p>
                    {bestSeller && (
                      <p className="font-body text-sm text-primary-foreground/70 mt-3">
                        {bestSeller.sales} ventas · {money(bestSeller.revenue)}
                      </p>
                    )}
                    <div className="mt-8 border-t border-primary-foreground/15 pt-5 font-body text-sm text-primary-foreground/70">
                      {data.orders.length} compras registradas en total.
                    </div>
                  </div>
                </section>
              </>
            )}

            {tab === "ventas" && (
              <section className="rounded-2xl bg-background border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-4">
                  <h2 className="font-display text-xl">Compras</h2>
                  <span className="font-body text-xs text-muted-foreground">{data.orders.length} registros</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase tracking-widest">
                      <tr>
                        <th className="text-left px-6 py-3">Fecha</th>
                        <th className="text-left px-6 py-3">Comprador</th>
                        <th className="text-left px-6 py-3">Email</th>
                        <th className="text-left px-6 py-3">Ebook</th>
                        <th className="text-right px-6 py-3">Monto</th>
                        <th className="text-right px-6 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order.id} className="border-t border-border hover:bg-secondary/40">
                          <td className="px-6 py-3 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-6 py-3">{order.buyerName ?? "—"}</td>
                          <td className="px-6 py-3 text-muted-foreground">{order.buyerEmail}</td>
                          <td className="px-6 py-3">{order.ebookTitle}</td>
                          <td className="px-6 py-3 text-right">{money(order.amount, order.currency)}</td>
                          <td className="px-6 py-3 text-right">
                            <StatusPill status={order.status} />
                          </td>
                        </tr>
                      ))}
                      {data.orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            Todavía no hay compras registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "catalogo" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl">Catálogo de ebooks</h2>
                  <button
                    onClick={() => {
                      resetForm();
                      setFormOpen((v) => !v);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-body text-sm font-medium"
                  >
                    {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {formOpen ? "Cerrar" : "Nuevo ebook"}
                  </button>
                </div>

                {formOpen && (
                  <section className="rounded-2xl bg-background border border-border p-6 shadow-sm">
                    <h3 className="font-display text-xl mb-5">
                      {form.id ? "Editar ebook" : "Subir un nuevo ebook"}
                    </h3>
                    <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-2">
                      <label className="block">
                        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                          Título del producto
                        </span>
                        <input
                          required
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
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
                          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
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
                          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
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
                          className="mt-2 w-full rounded-lg border border-dashed border-border px-4 py-3 font-body text-sm"
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
                          className="mt-2 w-full rounded-lg border border-dashed border-border px-4 py-3 font-body text-sm"
                        />
                      </label>
                      <div className="lg:col-span-2 flex flex-wrap items-center gap-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-8 py-4 font-body text-sm font-medium disabled:opacity-60"
                        >
                          <Plus className="w-4 h-4" />{" "}
                          {saving ? "Guardando…" : form.id ? "Guardar cambios" : "Publicar ebook"}
                        </button>
                        {form.id && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="font-body text-sm text-muted-foreground underline"
                          >
                            Cancelar edición
                          </button>
                        )}
                      </div>
                    </form>
                  </section>
                )}

                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.ebooks.map((ebook) => (
                    <article
                      key={ebook.id}
                      className="rounded-2xl bg-background border border-border p-5 shadow-sm flex flex-col"
                    >
                      {ebook.coverUrl ? (
                        <img
                          src={ebook.coverUrl}
                          alt={ebook.title}
                          className="w-full h-44 object-contain mb-4 rounded-lg bg-secondary/60"
                        />
                      ) : (
                        <div className="w-full h-44 mb-4 rounded-lg bg-secondary/60 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground" strokeWidth={1.2} />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg leading-tight">{ebook.title}</h3>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 font-body text-xs ${
                            ebook.isPublished
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                              : "border-border bg-secondary text-muted-foreground"
                          }`}
                        >
                          {ebook.isPublished ? "Publicado" : "Oculto"}
                        </span>
                      </div>
                      <p className="font-display text-xl mt-2">{money(ebook.price, ebook.currency)}</p>
                      <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-3 flex-1">
                        {ebook.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                        <button
                          onClick={() => startEdit(ebook)}
                          className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-widest"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        {ebook.isPublished && (
                          <button
                            onClick={async () => {
                              await deleteFn({ data: { id: ebook.id } });
                              await refetch();
                            }}
                            className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-widest text-destructive"
                          >
                            <EyeOff className="w-3.5 h-3.5" /> Ocultar
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  {data.ebooks.length === 0 && (
                    <p className="font-body text-sm text-muted-foreground">Todavía no cargaste ebooks.</p>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
