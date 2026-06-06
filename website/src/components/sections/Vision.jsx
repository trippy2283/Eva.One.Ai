import { motion } from 'framer-motion';

const Vision = () => {
  return (
    <section id="about" className="py-40 px-6 relative overflow-hidden bg-brand-void">
       {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-pink/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-violet/50 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-pink font-bold mb-6 block text-center">The Philosophy</span>
          <h2 className="text-4xl md:text-6xl mb-10 font-display leading-[1.1] text-brand-white">
            REDEFINING THE INTERSECTION OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-violet">CREATIVITY AND INTELLIGENCE</span>
          </h2>
          
          <p className="text-brand-slate text-xl md:text-2xl leading-relaxed mb-12 font-light">
            We are building an interconnected platform of products, services, and experiences that collectively expand human potential. From executive AI to interactive entertainment, we are the Creative Intelligence Ecosystem.
          </p>

          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-pink shadow-[0_0_30px_-10px_rgba(188,0,255,0.5)]">
            <div className="bg-brand-void px-10 py-3 rounded-full text-xs font-display uppercase tracking-widest border border-white/5">
              The Future is Mentally Creative
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Vision;
