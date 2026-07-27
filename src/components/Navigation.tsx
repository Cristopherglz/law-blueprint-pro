import { useState, useEffect } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force "scrolled" styling on non-home pages so links remain readable on white bg
  const compact = isScrolled || !isHome;

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Información', href: '#about' },
    { name: 'Áreas de práctica', href: '#services' },
    { name: 'Contacto', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (!isHome) {
      window.location.href = `/${href}`;
      return;
    }
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${compact ? 'glass shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="container-legal">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={compact ? '/images/logo-dark.png' : '/images/logo.png'} alt="Cristopher González - Abogado y Procurador" className={`transition-all duration-300 ${compact ? 'h-14' : 'h-16'}`} />
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className={`font-body text-sm font-medium underline-animation transition-colors duration-300 ${compact ? 'text-foreground/70 hover:text-foreground' : 'text-primary-foreground/80 hover:text-primary-foreground'}`}>
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/biblioteca"
              className={`group inline-flex items-center gap-2 px-5 py-3 font-body text-sm font-semibold transition-all duration-300 rounded-full ${compact ? 'bg-foreground text-background hover:bg-foreground/85' : 'bg-primary-foreground text-foreground hover:bg-primary-foreground/90'} hover:shadow-lg hover:-translate-y-0.5`}
            >
              <BookOpen className="w-4 h-4" />
              Ebooks
              <span className="ml-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-foreground/10 group-hover:bg-foreground/20">
                Nuevo
              </span>
            </Link>
            <a href="https://api.whatsapp.com/send/?phone=5493764327285&text=Hola!%20Necesito%20reservar%20un%20turno%20para%20consulta!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
              className={`px-6 py-3 border font-body text-sm font-medium transition-all duration-300 ${compact ? 'border-foreground text-foreground hover:bg-primary hover:text-primary-foreground' : 'border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground'}`}>
              Solicitar consulta
            </a>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`lg:hidden p-2 ${compact ? 'text-foreground' : 'text-primary-foreground'}`} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[32rem] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
          <div className="bg-background rounded-lg shadow-xl p-6 space-y-4">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="block font-body text-base text-foreground/70 hover:text-foreground transition-colors py-2">{link.name}</a>
            ))}
            <Link to="/biblioteca" onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-foreground text-background font-body text-sm font-semibold rounded-full">
              <BookOpen className="w-4 h-4" /> Biblioteca de Ebooks
            </Link>
            <a href="https://api.whatsapp.com/send/?phone=5493764327285&text=Hola!%20Necesito%20reservar%20un%20turno%20para%20consulta!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3 border border-foreground text-foreground font-body text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Solicitar consulta
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
