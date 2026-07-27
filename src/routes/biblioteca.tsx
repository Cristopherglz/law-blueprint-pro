import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import ebookCover from "@/assets/ebook-contratos.png.asset.json";

export const Route = createFileRoute("/biblioteca")({
  component: Biblioteca,
  head: () => ({
    meta: [
      { title: "Ebooks de Derecho | Abg. Cristopher González" },
      {
        name: "description",
        content:
          "Solicitá acceso a la Guía práctica para entender Contratos: cómo redactar y revisar contratos para proteger tus intereses.",
      },
      { property: "og:title", content: "Ebooks de Derecho | Abg. Cristopher González" },
      {
        property: "og:description",
        content: "Guía práctica para entender Contratos. Solicitá tu acceso por WhatsApp.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/biblioteca" },
    ],
    links: [{ rel: "canonical", href: "/biblioteca" }],
  }),
});

const whatsappBase =
  "https://api.whatsapp.com/send/?phone=5493764327285&type=phone_number&app_absent=0&text=";

function Biblioteca() {
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
              tomar mejores decisiones. Por el momento podés solicitar acceso al siguiente título.
            </p>
          </div>

          <article className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-center bg-secondary border border-border p-8 sm:p-12">
            <div className="relative mx-auto w-full max-w-[320px]">
              <img
                src={ebookCover.url}
                alt="Portada del ebook Guía práctica para entender Contratos"
                className="w-full h-auto shadow-2xl"
                loading="lazy"
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-body font-medium tracking-widest uppercase text-muted-foreground border border-border px-2.5 py-1 rounded-full mb-6">
                <BookOpen className="w-3.5 h-3.5" /> Contratos
              </span>
              <h2 className="font-display text-3xl lg:text-4xl leading-tight mb-4">
                Guía práctica para entender Contratos
              </h2>
              <p className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Cómo redactar y revisar contratos para proteger tus intereses. Una guía clara, con
                ejemplos y cláusulas clave que no podés pasar por alto.
              </p>
              <a
                href={`${whatsappBase}${encodeURIComponent("Hola! Quiero solicitar acceso al Ebook: Guía práctica para entender Contratos")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body text-sm font-medium hover:bg-foreground/85 transition-all duration-300"
              >
                <Download className="w-4 h-4" /> Solicitar acceso
              </a>
            </div>
          </article>

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
