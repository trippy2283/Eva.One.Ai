import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Shield, 
  Settings, 
  Video, 
  FlaskConical, 
  Trophy,
  MousePointer2
} from 'lucide-react';

const divisions = [
  {
    id: 'eva-one',
    name: 'EvaOne',
    tagline: 'Executive Operating System',
    description: 'AI-powered OS that centralizes strategic planning, project execution, and AI orchestration.',
    icon: Zap,
    color: '#00F2FF',
  },
  {
    id: 'boardroom-ai',
    name: 'Boardroom AI',
    tagline: 'Strategic Intelligence',
    description: 'Virtual executive leadership delivering strategic guidance and decision support.',
    icon: Brain,
    color: '#BC00FF',
  },
  {
    id: 'localmobile-ai',
    name: 'LocalMobile AI',
    tagline: 'Offline Infrastructure',
    description: 'Secure, resilient AI capabilities designed to operate without internet connectivity.',
    icon: Shield,
    color: '#00FF9D',
  },
  {
    id: 'automation-labs',
    name: 'Automation Labs',
    tagline: 'Intelligent Operations',
    description: 'Systems that eliminate repetitive work and optimize business process efficiency.',
    icon: Settings,
    color: '#FF00E5',
  },
  {
    id: 'creative-media',
    name: 'Mentally Creative Media',
    tagline: 'Creative Production',
    description: 'High-end content production and branding at the intersection of AI and human creativity.',
    icon: Video,
    color: '#FFB800',
  },
  {
    id: 'tech-lab',
    name: 'Creative Technology Lab',
    tagline: 'Research & Development',
    description: 'Innovation engine exploring emerging tech and developing future products.',
    icon: FlaskConical,
    color: '#FFFFFF',
  },
  {
    id: 'riftline',
    name: 'Riftline Racing',
    tagline: 'Interactive Entertainment',
    description: 'Original racing franchise combining simulation mechanics and competitive gameplay.',
    icon: Trophy,
    color: '#FF3D00',
  }
];

const Pillars = () => {
  return (
    <section id="ecosystem" className="py-32 px-6 bg-brand-grey/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[0.5em] text-brand-cyan font-bold mb-4 block"
          >
            The Ecosystem
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl mb-6 font-display"
          >
            THE SEVEN PILLARS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-slate max-w-2xl mx-auto text-lg"
          >
            Seven specialized divisions synergizing to expand the boundaries of human and machine potential.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {divisions.map((division, idx) => (
            <motion.div
              key={division.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                y: -8, 
                boxShadow: `0 0 40px -10px ${division.color}60`,
                borderColor: `${division.color}40`,
                transition: { duration: 0.2 } 
              }}
              className="glass p-8 flex flex-col items-start group cursor-pointer relative overflow-hidden h-full border-brand-white/5 transition-all duration-300"
            >
              {/* Animated Background Pulse */}
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full blur-[60px] pointer-events-none"
                style={{ backgroundColor: division.color }}
              ></div>
              
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] duration-300 relative z-10"
                style={{ backgroundColor: `${division.color}10`, color: division.color, border: `1px solid ${division.color}20` }}
              >
                <division.icon size={28} />
              </div>
              
              <h3 className="text-2xl mb-2 group-hover:text-brand-white transition-colors font-display text-brand-white/90 leading-none">{division.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-60" style={{ color: division.color }}>{division.tagline}</p>
              
              <p className="text-brand-slate text-sm mb-8 flex-grow leading-relaxed font-light">
                {division.description}
              </p>
              
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white/40 group-hover:text-brand-white transition-colors mt-auto group-hover:translate-x-2 duration-300">
                Explore <MousePointer2 size={12} />
              </div>
            </motion.div>
          ))}
          
          {/* Ecosystem Map CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-brand-cyan/10 to-brand-violet/10 rounded-xl border border-brand-white/10 group cursor-pointer"
          >
             <div className="absolute inset-0 bg-brand-void/40 backdrop-blur-[2px]"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-brand-white/5 flex items-center justify-center mx-auto mb-6 border border-brand-white/10 group-hover:border-brand-cyan/50 transition-colors">
                   <div className="w-8 h-8 rounded-full bg-brand-cyan animate-pulse blur-[8px] absolute"></div>
                   <div className="w-4 h-4 rounded-full bg-brand-white relative"></div>
                </div>
                <h3 className="text-xl font-display mb-2">NETWORK VIEW</h3>
                <p className="text-xs text-brand-slate uppercase tracking-widest mb-4">Interactive 3D Map</p>
                <p className="text-xs text-brand-white/60 font-light">Visualize the data flow and synergy between all divisions.</p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pillars;
