import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImg from '../../assets/neural-nexus-hero.png';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Neural Nexus Hero" 
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-void/80 via-brand-void/50 to-brand-void"></div>
      </div>

      {/* Decorative Blur Blobs */}
      <div className="absolute inset-0 z-1 px-6 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-cyan/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-brand-violet/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-display mb-6 tracking-display leading-tight"
        >
          MENTALLY CREATIVE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-pink">STUDIOS</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-brand-slate text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light uppercase tracking-[0.2em]"
        >
          The Creative Intelligence Ecosystem.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button className="btn-primary px-10 py-5 text-lg w-full sm:w-auto flex items-center justify-center gap-3 group">
            Enter the Ecosystem 
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="btn-secondary px-10 py-5 text-lg w-full sm:w-auto">
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-slate/50">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-cyan to-transparent"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
