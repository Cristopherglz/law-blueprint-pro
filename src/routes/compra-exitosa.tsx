import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { getPurchase } from "@/lib/ebooks.functions";

type Search = { token?: string; payment_id?: string };

export const Route = createFileRoute("/compra-exitosa")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
    payment_id: typeof search["payment_id"] === "string" ? (search["payment_id"] as string) : undefined,
  }),
  component: SuccessPage,
  head: () => ({
    meta: [
      { title: "Compra exitosa | Ebooks Abg. Cristopher González" },
      { name: "description", content: "Gracias por tu compra: descargá tu ebook de derecho al instante." },
      { property: "og:title", content: "Compra exitosa | Ebooks de Derecho" },
      { property: "og:description", content: "Descargá el ebook que acabás de comprar." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SuccessPage() {
  const { token, payment_id } = Route.useSearch();
  const fetchPurchase = useServerFn(getPurchase);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["purchase", token, payment_id],
    enabled: Boolean(token),
    refetchInterval: (query) => (query.state.data?.status === "paid" ? false : 5000),
    queryFn: () => fetchPurchase({ data: { token: token!, paymentId: payment_id } }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container-legal max-w-2xl text-center">
          {!token && (
            <p className="font-body text-muted-foreground">No encontramos la referencia de tu compra.</p>
          )}

          {token && isLoading && <p className="font-body text-muted-foreground">Verificando el pago…</p>}

          {data?.status === "paid" && (
            <>
              <CheckCircle2 className="w-14 h-14 mx-auto text-foreground mb-6" strokeWidth={1.2} />
              <h1 className="font-display text-4xl lg:text-5xl mb-4">¡Compra confirmada!</h1>
              <p className="font-body text-muted-foreground mb-10">
                {data.buyerName ? `${data.buyerName}, ` : ""}ya podés descargar{" "}
                <strong className="text-foreground">{data.ebookTitle}</strong>.
              </p>
              {data.downloadUrl ? (
                <a
                  href={data.downloadUrl}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-body text-sm font-medium"
                >
                  <Download className="w-4 h-4" /> Descargar ebook
                </a>
              ) : (
                <p className="font-body text-sm text-muted-foreground">
                  El archivo se está preparando. Escribinos por WhatsApp y te lo enviamos al instante.
                </p>
              )}
            </>
          )}

          {data?.status === "pending" && (
            <>
              <Clock className="w-14 h-14 mx-auto text-muted-foreground mb-6" strokeWidth={1.2} />
              <h1 className="font-display text-4xl mb-4">Pago en proceso</h1>
              <p className="font-body text-muted-foreground mb-8">
                Estamos esperando la confirmación de Mercado Pago. Esta página se actualiza automáticamente.
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 border border-border px-6 py-3 font-body text-sm"
              >
                {isRefetching ? "Verificando…" : "Verificar de nuevo"}
              </button>
            </>
          )}

          {data?.status === "not_found" && (
            <p className="font-body text-muted-foreground">No encontramos esa compra.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}