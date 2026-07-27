import { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const EbooksBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-background">
      <div className="container-legal">
        <Link
          to="/biblioteca"
          aria-label="Acceder a la biblioteca de Ebooks de Derecho"
          className={`group block relative overflow-hidden rounded-2xl bg-legal-dark text-primary-foreground transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1`}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          {/* Glow accent */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center p-8 sm:p-12 lg:p-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-xs font-body font-medium tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                ACCESO EXCLUSIVO
              </span>

              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                Conoce tus derechos.
                <br />
                <span className="italic font-light text-primary-foreground/80">Domina la ley.</span>
              </h2>

              <p className="font-body text-base sm:text-lg text-primary-foreground/70 max-w-2xl leading-relaxed">
                Accede a nuestra biblioteca de <strong className="text-primary-foreground font-semibold">Ebooks de Derecho.</strong>&nbsp;Guías prácticas, claras y descargables para entender lo que la ley dice sobre tu caso, tu trabajo y tu futuro.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <span className="inline-flex items-center gap-3 text-primary-foreground font-body font-semibold text-base group-hover:gap-5 transition-all duration-300">
                  Ingresar a la biblioteca
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground text-foreground transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </span>
                <span className="font-body text-sm text-primary-foreground/50">
                  + de 10 títulos disponibles
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-foreground/10 rounded-full blur-2xl scale-110" />
                <div className="relative w-48 h-48 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                  <BookOpen className="w-24 h-24 text-primary-foreground/90" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default EbooksBanner;
