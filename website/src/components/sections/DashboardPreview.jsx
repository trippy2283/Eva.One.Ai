import { motion } from 'framer-motion';
import dashboardImg from '../../assets/eva-one-dashboard-preview.png';

const DashboardPreview = () => {
  return (
    <section id="platforms" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-brand-cyan font-bold mb-4 block">Flagship Platform</span>
            <h2 className="text-4xl md:text-6xl mb-8 font-display">EVAONE</h2>
            <p className="text-brand-slate text-lg mb-8 leading-relaxed">
              The Executive Operating System for the modern era. Centralize your strategy, orchestrate your AI workforce, and automate your most complex workflows in a unified, high-performance environment.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                'AI-Powered Agent Orchestration',
                'Unified Strategic Intelligence',
                'Seamless Workflow Automation',
                'Secure Knowledge Infrastructure'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-brand-white/80 font-light">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
                  {item}
                </li>
              ))}
            </ul>

            <button className="btn-primary px-8 py-4">Explore EvaOne</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-cyan/20 to-brand-violet/20 blur-3xl rounded-full opacity-50"></div>
            <div className="relative glass p-2 rounded-2xl border-brand-white/10 overflow-hidden shadow-2xl">
              <img 
                src={dashboardImg} 
                alt="EvaOne Dashboard Preview" 
                className="rounded-xl w-full h-auto"
              />
              
              {/* Overlay Glass Element */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 glass p-4 rounded-lg border-brand-cyan/30 text-[10px] uppercase tracking-widest text-brand-cyan bg-brand-cyan/5 hidden md:block"
              >
                Intelligence Active
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
