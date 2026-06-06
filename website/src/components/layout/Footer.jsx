const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-brand-white/5 bg-brand-void">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="font-display text-xl tracking-tighter flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 bg-brand-white rounded-md"></div>
          <span>MCS</span>
        </div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-brand-slate">
          <a href="#" className="hover:text-brand-white">Privacy</a>
          <a href="#" className="hover:text-brand-white">Terms</a>
          <a href="#" className="hover:text-brand-white">Contact</a>
          <a href="#" className="hover:text-brand-white">X</a>
          <a href="#" className="hover:text-brand-white">Discord</a>
        </div>
        <p className="text-brand-slate text-xs opacity-50">
          &copy; {new Date().getFullYear()} Mentally Creative Studios. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
