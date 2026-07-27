import { useEffect, useRef, useState } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const siteMap = [
    { name: 'Áreas de práctica', href: '#services' },
    { name: 'Información profesional', href: '#about' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <footer ref={footerRef} className="bg-[#1a1a1a] text-primary-foreground relative overflow-hidden">
      <div className="container-legal py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className={`lg:col-span-1 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="inline-block mb-6">
              <img src="/images/logo.png" alt="Cristopher González - Abogado y Procurador" className="h-20 w-auto mb-4" />
            </a>
            <p className="font-body text-sm text-primary-foreground/40 leading-relaxed">Con un compromiso firme en cuidar tus intereses, te ofrezco un servicio jurídico que simplifica los procesos complejos.</p>
          </div>

          <div className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
            <h4 className="font-body text-sm font-medium uppercase tracking-wider mb-6 text-primary-foreground">Información de Contacto</h4>
            <div className="space-y-3">
              <p className="font-body text-sm text-primary-foreground/40">Av. López y Planes 3887<br />Posadas, Misiones</p>
              <p><a href="tel:+5493764327285" className="font-body text-sm text-primary-foreground/40 hover:text-primary-foreground transition-colors">Teléfono: +54 9 376-4327285</a></p>
              <p><a href="mailto:abogadogonzalezok@gmail.com" className="font-body text-sm text-primary-foreground/40 hover:text-primary-foreground transition-colors">Email: abogadogonzalezok@gmail.com</a></p>
              <p className="font-body text-sm text-primary-foreground/40">Lunes a Viernes: 8:00 AM – 20:00 PM</p>
            </div>
          </div>

          <div className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '300ms' }}>
            <h4 className="font-body text-sm font-medium uppercase tracking-wider mb-6 text-primary-foreground">Mapa del Sitio</h4>
            <ul className="space-y-3">
              {siteMap.map((link, index) => (
                <li key={index} className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: `${400 + index * 50}ms` }}>
                  <a href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="group font-body text-sm text-primary-foreground/40 hover:text-primary-foreground transition-colors duration-300 inline-flex items-center gap-2">
                    <span className="w-0 h-px bg-primary-foreground transition-all duration-300 group-hover:w-3" />{link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
            <h4 className="font-body text-sm font-medium uppercase tracking-wider mb-6 text-primary-foreground">Verificación Fiscal</h4>
            <a href="http://qr.afip.gob.ar/?qr=Wlz2Y9DvIxHc0yE3aJqxqg,," target="_F960AFIPInfo" rel="noopener noreferrer" className="inline-block">
              <img src="http://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="DATA FISCAL - AFIP" className="w-auto h-auto max-w-[150px] border-0" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-legal py-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '600ms' }}>
            <p className="font-body text-xs text-primary-foreground/30">Copyright © {new Date().getFullYear()} Cristopher González - Abogado</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <a href="/terminos-y-condiciones.html" className="font-body text-xs text-primary-foreground/30 hover:text-primary-foreground transition-colors">Términos y Condiciones</a>
              <a href="/politica-de-privacidad.html" className="font-body text-xs text-primary-foreground/30 hover:text-primary-foreground transition-colors">Política de privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
