import { useScroll } from '../../hooks/useScroll';
import logo from '../../assets/mcs-logo-concept.png';

const Header = () => {
  const scrolled = useScroll();

  return (
    <header className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-brand-void border-b border-brand-white/10' : 'bg-transparent border-b border-transparent'}`}>
      <div className="flex items-center gap-3">
        <img src={logo} alt="MCS Logo" className="w-8 h-8 object-contain" />
        <span className="font-display text-xl tracking-display">MCS</span>
      </div>
      <nav className="hidden md:flex gap-8 text-[10px] font-bold tracking-display uppercase text-brand-slate">
        <a href="#ecosystem" className="hover:text-brand-cyan transition-colors">Ecosystem</a>
        <a href="#platforms" className="hover:text-brand-cyan transition-colors">Platforms</a>
        <a href="#ventures" className="hover:text-brand-cyan transition-colors">Ventures</a>
        <a href="#about" className="hover:text-brand-cyan transition-colors">About</a>
      </nav>
      <button className="btn-primary text-[10px] px-5 py-2.5 uppercase tracking-display">
        Get Started
      </button>
    </header>
  );
};

export default Header;
