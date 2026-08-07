import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, BookOpen, FileText, ShoppingCart, ShieldCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import ebookCover from "@/assets/ebook-contratos.png.asset.json";
import { listEbooks, startCheckout, type PublicEbook } from "@/lib/ebooks.functions";

export const Route = createFileRoute("/biblioteca")({
  component: Biblioteca,
  head: () => ({
    meta: [
      { title: "Ebooks de Derecho | Abg. Cristopher González" },
      {
        name: "description",
        content:
          "Comprá la Guía práctica para entender Contratos: cómo redactar y revisar contratos para proteger tus intereses. Pago seguro con Mercado Pago.",
      },
      { property: "og:title", content: "Ebooks de Derecho | Abg. Cristopher González" },
      {
        property: "og:description",
        content: "Guía práctica para entender Contratos. Descarga inmediata tras el pago.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/biblioteca" },
    ],
    links: [{ rel: "canonical", href: "/biblioteca" }],
  }),
});

const whatsappBase =
  "https://api.whatsapp.com/send/?phone=5493764327285&type=phone_number&app_absent=0&text=";

const money = (value: number, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

function BuyForm({ ebook, size = "md" }: { ebook: PublicEbook; size?: "md" | "sm" }) {
  const checkout = useServerFn(startCheckout);
  const [open, setOpen] = useState(false);
  const [buyer, setBuyer] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onBuy() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await checkout({
        data: { ebookId: ebook.id, name: buyer.name, email: buyer.email },
      });
      if (result.status === "ready" && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setStatus("El pago online todavía no está habilitado. Volvé a intentar en unos minutos.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No pudimos iniciar el pago.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-medium hover:bg-foreground/85 transition-all duration-300 ${
          size === "md" ? "px-8 py-4 text-sm" : "w-full px-6 py-3.5 text-sm"
        }`}
      >
        <ShoppingCart className="w-4 h-4" /> Comprar ebook
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onBuy();
      }}
      className="space-y-3 max-w-sm"
    >
      <input
        required
        placeholder="Tu nombre"
        value={buyer.name}
        onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
        className="w-full border border-border bg-background px-4 py-3 font-body text-sm"
      />
      <input
        required
        type="email"
        placeholder="Tu email"
        value={buyer.email}
        onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
        className="w-full border border-border bg-background px-4 py-3 font-body text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 font-body text-sm font-medium disabled:opacity-60"
      >
        <ShoppingCart className="w-4 h-4" /> {loading ? "Redirigiendo…" : "Pagar con Mercado Pago"}
      </button>
      <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" /> Recibís el enlace de descarga al confirmarse el pago.
      </p>
      {status && <p className="font-body text-xs text-destructive">{status}</p>}
    </form>
  );
}

function Biblioteca() {
  const fetchEbooks = useServerFn(listEbooks);
  const { data: ebooks } = useQuery({ queryKey: ["public-ebooks"], queryFn: () => fetchEbooks() });
  const featured = ebooks?.[0];
  const rest = (ebooks ?? []).slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-20">
        <div className="container-legal">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>

          <div className="max-w-3xl mb-16">
            <span className="inline-flex items-center gap-3 text-sm font-body font-medium text-muted-foreground tracking-widest uppercase mb-6">
              <span className="decorative-line bg-muted-foreground/60"></span>
              Biblioteca
            </span>
            <h1 className="font-display text-5xl lg:text-6xl leading-[1.1] mb-6">
              Ebooks de <em className="font-light">Derecho</em>
            </h1>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Recursos prácticos redactados por nuestro estudio para ayudarte a comprender la ley y
              tomar mejores decisiones. Comprá con Mercado Pago y descargá al instante.
            </p>
          </div>

          <article className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-center bg-secondary border border-border p-8 sm:p-12">
            <div className="relative mx-auto w-full max-w-[320px]">
              <img
                src={featured?.coverUrl ?? ebookCover.url}
                alt={`Portada del ebook ${featured?.title ?? "Guía práctica para entender Contratos"}`}
                className="w-full h-auto shadow-2xl"
                loading="lazy"
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-body font-medium tracking-widest uppercase text-muted-foreground border border-border px-2.5 py-1 rounded-full mb-6">
                <BookOpen className="w-3.5 h-3.5" /> Contratos
              </span>
              <h2 className="font-display text-3xl lg:text-4xl leading-tight mb-4">
                {featured?.title ?? "Guía práctica para entender Contratos"}
              </h2>
              <p className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
                {featured?.description ??
                  "Cómo redactar y revisar contratos para proteger tus intereses. Una guía clara, con ejemplos y cláusulas clave que no podés pasar por alto."}
              </p>
              {featured && (
                <>
                  <p className="font-display text-4xl mb-6">{money(featured.price, featured.currency)}</p>
                  <BuyForm ebook={featured} />
                </>
              )}
            </div>
          </article>

          {rest.length > 0 && (
            <section className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((ebook) => (
                <article key={ebook.id} className="bg-secondary border border-border p-6 flex flex-col">
                  {ebook.coverUrl && (
                    <img
                      src={ebook.coverUrl}
                      alt={`Portada del ebook ${ebook.title}`}
                      className="w-full h-56 object-contain mb-5"
                      loading="lazy"
                    />
                  )}
                  <h3 className="font-display text-2xl leading-tight mb-3">{ebook.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                    {ebook.description}
                  </p>
                  <p className="font-display text-2xl mb-5">{money(ebook.price, ebook.currency)}</p>
                  <BuyForm ebook={ebook} size="sm" />
                </article>
              ))}
            </section>
          )}

          <div className="mt-20 p-10 lg:p-14 bg-legal-dark text-primary-foreground rounded-2xl text-center">
            <FileText className="w-10 h-10 mx-auto mb-5 opacity-80" strokeWidth={1.2} />
            <h3 className="font-display text-3xl lg:text-4xl mb-4">
              ¿Necesitas asesoría personalizada?
            </h3>
            <p className="font-body text-primary-foreground/70 max-w-xl mx-auto mb-8">
              Nuestros Ebooks son una guía, pero cada caso es único. Conversemos sobre el tuyo.
            </p>
            <a
              href={`${whatsappBase}${encodeURIComponent("Hola! Necesito reservar un turno para consulta!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-primary-foreground text-foreground font-body text-sm font-medium hover:bg-primary-foreground/90 transition-all"
            >
              Agendar consulta
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
