import { useEffect, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-primary overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/hero-bg-new.jpg" alt="Cristopher González" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
      </div>

      <div className="container-legal relative z-10">
        <div className="min-h-screen flex flex-col justify-center py-32">
          <div className="max-w-3xl text-left">
            <p className={`font-body text-lg text-primary-foreground/70 leading-relaxed max-w-xl mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
              Obtené asistencia legal de primera calidad, con consejos claros, precisos y eficaces, y disfrutá de la tranquilidad que te brinda una asesoría legal por parte de un profesional habilitado en la matrícula.
            </p>
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '600ms', transitionTimingFunction: 'var(--ease-spring)' }}>
              <a href="https://api.whatsapp.com/send/?phone=5493764327285&text=Hola!%20Necesito%20reservar%20un%20turno%20para%20consulta!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-foreground text-foreground font-body text-base font-medium hover:bg-secondary transition-all duration-300 hover:-translate-y-1">
                Solicitar consulta
              </a>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 border-t border-primary-foreground/20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
            <div className="container-legal py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-primary-foreground/60" />
                  <div>
                    <span className="block font-body text-xs text-primary-foreground/50 uppercase tracking-wider">Ubicado en</span>
                    <span className="font-body text-lg text-primary-foreground">Posadas, Misiones</span>
                  </div>
                </div>
                <div className="hidden md:block w-px h-12 bg-primary-foreground/20" />
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-primary-foreground/60" />
                  <div>
                    <span className="block font-body text-xs text-primary-foreground/50 uppercase tracking-wider">Teléfono de emergencias</span>
                    <a href="tel:+5493764327285" className="font-body text-lg text-primary-foreground hover:text-primary-foreground/80 transition-colors">+54 9 3764-327285</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Float */}
      <a href="https://api.whatsapp.com/send/?phone=5493764327285&text=Hola!%20Necesito%20consultar!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#25D366] text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" aria-label="Contáctese por WhatsApp">
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </section>
  );
};

export default Hero;
