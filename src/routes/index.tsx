import { createFileRoute } from "@tanstack/react-router";
import Navigation from "@/components/Navigation";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Services from "@/sections/Services";
import EbooksBanner from "@/sections/EbooksBanner";
import Plans from "@/sections/Plans";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Abg. Cristopher González | Abogado en Posadas, Misiones" },
      {
        name: "description",
        content:
          "Asesoría legal en franquicias, marcas y patentes, sociedades, gestoría automotor y defensa penal en Posadas, Misiones.",
      },
      { property: "og:title", content: "Abg. Cristopher González | Abogado en Posadas, Misiones" },
      {
        property: "og:description",
        content:
          "Asesoría legal clara y eficaz: franquicias, propiedad intelectual, sociedades, gestoría automotor y más.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Plans />
        <EbooksBanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
