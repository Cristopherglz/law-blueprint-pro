import { useEffect, useRef, useState } from 'react';
import { Check, Building2, Briefcase, ArrowRight } from 'lucide-react';

const WHATSAPP_NUMBER = '5493541234567';

const plans = [
  {
    id: 'pyme',
    icon: Briefcase,
    name: 'Plan PyME',
    tagline: 'Asistencia legal integral para pequeñas y medianas empresas',
    price: 60000,
    highlight: false,
    features: [
      'Consultas jurídicas ilimitadas',
      'Revisión y redacción de contratos',
      'Presentación de trámites',
      'Gestión de expedientes',
      'Atención prioritaria por WhatsApp',
    ],
    whatsappText: 'Hola! Quiero contratar el Plan PyME de asistencia legal mensual.',
  },
  {
    id: 'empresa',
    icon: Building2,
    name: 'Plan Corporativo',
    tagline: 'Cobertura legal completa para grandes empresas',
    price: 240000,
    highlight: true,
    features: [
      'Consultas jurídicas ilimitadas y prioritarias',
      'Revisión y redacción avanzada de contratos',
      'Presentación y seguimiento de trámites',
      'Gestión completa de expedientes',
      'Asesor legal asignado dedicado',
      'Reuniones mensuales de estrategia legal',
    ],
    whatsappText: 'Hola! Quiero contratar el Plan Corporativo de asistencia legal mensual.',
  },
];

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);

const Plans = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="planes" ref={sectionRef} className="section-padding bg-background relative overflow-hidden">
      <div className="container-legal relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className={`inline-flex items-center justify-center gap-3 text-sm font-body font-medium text-muted-foreground tracking-widest uppercase mb-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <span className="decorative-line bg-muted-foreground/60"></span>Planes de Suscripción<span className="decorative-line bg-muted-foreground/60"></span>
          </span>
          <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight tracking-tight mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            Asistencia legal mensual <span className="italic font-light text-primary/80">para tu empresa</span>
          </h2>
          <p className={`font-body text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            Acompañamiento legal continuo con tarifa fija mensual. Consultas, contratos, trámites y expedientes gestionados por nuestro equipo de abogados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 lg:p-10 flex flex-col transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${plan.highlight ? 'bg-legal-dark text-primary-foreground border-legal-dark shadow-2xl md:-translate-y-2 hover:md:-translate-y-3' : 'bg-card text-card-foreground border-border hover:shadow-xl hover:-translate-y-1'}`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-foreground text-foreground text-xs font-body font-semibold tracking-widest uppercase">
                    Más completo
                  </span>
                )}

                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${plan.highlight ? 'bg-primary-foreground/10' : 'bg-secondary'}`}>
                  <Icon className={`w-7 h-7 ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`} strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-3xl mb-2">{plan.name}</h3>
                <p className={`font-body text-sm mb-6 ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {plan.tagline}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl">${formatPrice(plan.price)}</span>
                    <span className={`font-body text-sm ${plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>ARS / mes</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 font-body text-sm">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-primary-foreground' : 'text-primary'}`} strokeWidth={2} />
                      <span className={plan.highlight ? 'text-primary-foreground/90' : 'text-foreground/80'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(plan.whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-body font-semibold text-base transition-all duration-300 ${plan.highlight ? 'bg-primary-foreground text-foreground hover:bg-primary-foreground/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                >
                  Contratar plan
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            );
          })}
        </div>

        <p className={`text-center font-body text-sm text-muted-foreground mt-10 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          ¿Necesitás un plan a medida? <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero consultar por un plan de asistencia legal a medida.')}`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Hablemos por WhatsApp</a>
        </p>
      </div>
    </section>
  );
};

export default Plans;
