import { useEffect, useRef, useState } from 'react';
import { Store, BadgeCheck, FolderCheck, Landmark, Rocket, Car, Shield, Building } from 'lucide-react';

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const services = [
    { id: 'franquicias', icon: Store, title: 'Derecho de franquicias', description: 'Asesoramiento integral para franquiciantes y franquiciados: contratos, expansión y cumplimiento.', whatsappText: 'Hola! Necesito consultar sobre derecho de franquicias.' },
    { id: 'marcas', icon: BadgeCheck, title: 'Registro de marcas y patentes', description: 'Protegemos tu propiedad intelectual: registro de marcas, patentes y defensa ante conflictos.', whatsappText: 'Hola! Necesito consultar sobre registro de marcas y patentes (propiedad intelectual).' },
    { id: 'sociedades', icon: FolderCheck, title: 'Constitución de sociedades', description: 'Gestionamos la constitución y desarrollo de tu sociedad, asociación, cooperativa o mutual.', whatsappText: 'Hola! Necesito consultar sobre Constitución de sociedades' },
    { id: 'tributario', icon: Landmark, title: 'Derecho Financiero y Tributario', description: 'Te representamos ante ARCA (ex AFIP) y otros organismos de recaudación fiscal.', whatsappText: 'Hola! Necesito consultar sobre derecho financiero y tributario.' },
    { id: 'emprendimiento', icon: Rocket, title: 'Asistencia legal para tu emprendimiento', description: 'Apoyo legal integral para emprendedores en todas las etapas del proyecto.', whatsappText: 'Hola! Necesito consultar sobre asistencia legal para emprendedores.' },
    { id: 'automotor', icon: Car, title: 'Gestoría automotor', description: 'Transferencias, altas, bajas y todo trámite ante el Registro Automotor, gestionado de punta a punta.', whatsappText: 'Hola! Necesito consultar sobre gestoría automotor.' },
    { id: 'penal', icon: Shield, title: 'Defensa penal', description: 'Protegemos tus derechos en casos penales, asegurando una defensa sólida y eficiente.', whatsappText: 'Hola! Necesito consultar sobre defensa penal.' },
    { id: 'administrativo', icon: Building, title: 'Derecho Administrativo', description: 'Te representamos y asesoramos en trámites y conflictos con organismos estatales.', whatsappText: 'Hola! Necesito consultar sobre derecho administrativo.' },
  ];

  return (
    <section id="services" ref={sectionRef} className="section-padding bg-secondary relative overflow-hidden">
      <div className="container-legal relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className={`inline-flex items-center justify-center gap-3 text-sm font-body font-medium text-muted-foreground tracking-widest uppercase mb-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <span className="decorative-line bg-muted-foreground/60"></span>Servicios<span className="decorative-line bg-muted-foreground/60"></span>
          </span>
          <h2 className={`font-display text-4xl lg:text-5xl text-foreground mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            Áreas de práctica
          </h2>
          <p className={`font-body text-base text-muted-foreground leading-relaxed transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
            Al hacer clic en el área sobre la cual necesitas consultar, serás redirigido automáticamente a nuestro WhatsApp para que puedas recibir asistencia inmediata. ¡Estoy acá para ayudarte!
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const whatsappUrl = `https://api.whatsapp.com/send/?phone=5493764327285&text=${encodeURIComponent(service.whatsappText)}&type=phone_number&app_absent=0`;
            return (
              <a key={service.id} href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className={`group relative bg-background p-8 border border-border hover:border-foreground hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}>
                <div className="w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-muted-foreground transition-colors">{service.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <div className="absolute bottom-8 right-8 w-8 h-8 bg-secondary text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
