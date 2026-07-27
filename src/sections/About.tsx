import { useEffect, useRef, useState } from 'react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const institutions = [
    { name: 'Facultad de Derecho y Ciencias Sociales y Políticas', subtitle: 'Universidad Nacional del Nordeste' },
    { name: 'UNCAUS', subtitle: 'Universidad Nacional del Chaco Austral' },
    { name: 'UBA IALAB', subtitle: 'Universidad de Buenos Aires' },
  ];

  return (
    <section id="about" ref={sectionRef} className="section-padding bg-background relative overflow-hidden">
      <div className="container-legal relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <div className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
              <span className="inline-flex items-center gap-3 text-sm font-body font-medium text-muted-foreground tracking-widest uppercase mb-4">
                <span className="decorative-line bg-muted-foreground/60"></span>Presentación
              </span>
            </div>
            <h2 className={`font-display text-4xl lg:text-5xl text-foreground mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
              Información profesional
            </h2>
            <div className="space-y-6 mb-12">
              <p className={`font-body text-lg text-muted-foreground leading-relaxed transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
                Abogado egresado de la Facultad de Derecho y Ciencias Sociales y Políticas de la Universidad Nacional del Nordeste. A lo largo de mi carrera, he adquirido experiencia en la gestión de procesos ante organismos estatales y entidades privadas, así como en la redacción de escritos, contratos y convenios.
              </p>
              <p className={`font-body text-lg text-muted-foreground leading-relaxed transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '500ms' }}>
                Mi enfoque es ofrecer soluciones legales eficientes y adaptadas a las necesidades de cada cliente, siempre con un compromiso hacia la transparencia y el profesionalismo.
              </p>
            </div>
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              <h3 className="font-display text-2xl text-foreground mb-6">Con estudios cursados en</h3>
              <div className="space-y-4">
                {institutions.map((inst, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 bg-secondary transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: `${700 + index * 100}ms` }}>
                    <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-lg">{inst.name.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="block font-body text-base font-medium text-foreground">{inst.name}</span>
                      <span className="block font-body text-sm text-muted-foreground">{inst.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`relative transition-all duration-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`} style={{ transitionDelay: '300ms', transitionTimingFunction: 'var(--ease-expo-out)' }}>
            <div className="relative">
              <div className="relative overflow-hidden">
                <img src="/images/about-new.jpg" alt="Cristopher González - Abogado" className="w-full h-auto object-cover grayscale" style={{ maxHeight: '700px' }} />
              </div>
              <div className={`absolute -bottom-4 -right-4 w-full h-full border-2 border-foreground -z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-4 translate-y-4'}`} style={{ transitionDelay: '500ms' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
