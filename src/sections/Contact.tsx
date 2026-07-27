import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Calendar } from 'lucide-react';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectLabels: Record<string, string> = { contratos: 'Redacción de contratos', laboral: 'Derecho Laboral', mediacion: 'Mediación', tributario: 'Derecho Financiero y Tributario', emprendimiento: 'Asistencia legal para emprendedores', transito: 'Accidentes de tránsito', penal: 'Defensa penal', administrativo: 'Derecho Administrativo', otro: 'Otro' };
    const msg = `Hola! Mi nombre es ${formData.name}.\n\nEmail: ${formData.email}\n${formData.phone ? `Teléfono: ${formData.phone}\n` : ''}Asunto: ${subjectLabels[formData.subject] || formData.subject}\n\nMensaje:\n${formData.message}`;
    window.open(`https://api.whatsapp.com/send/?phone=5493764327285&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`, '_blank');
  };

  const contactInfo = [
    { icon: MapPin, title: 'Dirección', content: 'Av. López y Planes 3887, Posadas, Misiones' },
    { icon: Phone, title: 'Teléfono', content: '+54 9 376-4327285', href: 'tel:+5493764327285' },
    { icon: Mail, title: 'Email', content: 'abogadogonzalezok@gmail.com', href: 'mailto:abogadogonzalezok@gmail.com' },
    { icon: Clock, title: 'Horario de atención', content: 'Lunes a Viernes: 8:00 AM – 20:00 PM' },
  ];

  return (
    <section id="contact" ref={sectionRef} className="section-padding bg-background relative overflow-hidden">
      <div className="bg-primary text-primary-foreground py-16 mb-16">
        <div className="container-legal text-center">
          <span className={`block font-body text-sm text-primary-foreground/60 tracking-widest uppercase mb-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>Número para URGENCIAS 24/7</span>
          <a href="tel:+5493764327285" className={`block font-display text-4xl lg:text-5xl text-primary-foreground hover:text-primary-foreground/80 transition-all duration-700 mb-6 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>+54 9 376-4327285</a>
          <div className={`flex items-center justify-center gap-4 mb-8 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '300ms' }}>
            <span className="w-16 h-px bg-primary-foreground/30"></span><span className="text-primary-foreground/40">O</span><span className="w-16 h-px bg-primary-foreground/30"></span>
          </div>
          <p className={`font-body text-lg text-primary-foreground/80 mb-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>Puede reservar un turno</p>
          <a href="https://api.whatsapp.com/send/?phone=5493764327285&text=Hola!%20Necesito%20reservar%20un%20turno%20para%20consulta!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground text-primary-foreground font-body text-base font-medium hover:bg-primary-foreground hover:text-foreground transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '500ms' }}>
            <Calendar className="w-5 h-5" />Solicitar consulta
          </a>
        </div>
      </div>

      <div className="container-legal relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className={`inline-flex items-center justify-center gap-3 text-sm font-body font-medium text-muted-foreground tracking-widest uppercase mb-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '600ms' }}>
            <span className="decorative-line bg-muted-foreground/60"></span>Contacto<span className="decorative-line bg-muted-foreground/60"></span>
          </span>
          <h2 className={`font-display text-4xl lg:text-5xl text-foreground mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '700ms' }}>Información de contacto</h2>
          <p className={`font-body text-base text-muted-foreground leading-relaxed transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '800ms' }}>
            Con un compromiso firme en cuidar tus intereses, te ofrezco un servicio jurídico que simplifica los procesos complejos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '900ms' }}>
            <div className="space-y-6">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`flex items-start gap-4 p-6 bg-secondary transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                    <div>
                      <h4 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.title}</h4>
                      {item.href ? <a href={item.href} className="font-body text-base text-foreground hover:text-muted-foreground transition-colors">{item.content}</a> : <p className="font-body text-base text-foreground">{item.content}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} style={{ transitionDelay: '1000ms' }}>
            <div className="bg-secondary p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-body text-sm font-medium text-muted-foreground mb-2">Nombre completo *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-border font-body text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors" placeholder="Su nombre" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-body text-sm font-medium text-muted-foreground mb-2">Correo electrónico *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-border font-body text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors" placeholder="su@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block font-body text-sm font-medium text-muted-foreground mb-2">Teléfono</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-border font-body text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors" placeholder="+54 9 376 123 4567" />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block font-body text-sm font-medium text-muted-foreground mb-2">Asunto *</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-border font-body text-base text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors">
                      <option value="">Seleccione un asunto</option>
                      <option value="contratos">Redacción de contratos</option>
                      <option value="laboral">Derecho Laboral</option>
                      <option value="mediacion">Mediación</option>
                      <option value="tributario">Derecho Financiero y Tributario</option>
                      <option value="emprendimiento">Asistencia legal para emprendedores</option>
                      <option value="transito">Accidentes de tránsito</option>
                      <option value="penal">Defensa penal</option>
                      <option value="administrativo">Derecho Administrativo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block font-body text-sm font-medium text-muted-foreground mb-2">Mensaje *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 bg-background border border-border font-body text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-colors resize-none" placeholder="Describa su caso..." />
                </div>
                <button type="submit" className="w-full btn-primary">
                  <span className="flex items-center justify-center gap-2">
                    Enviar mensaje por WhatsApp
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                </button>
                <p className="font-body text-xs text-muted-foreground text-center">Al hacer clic en "Enviar mensaje", serás redirigido a WhatsApp con tu consulta.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
