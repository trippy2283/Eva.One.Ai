import { motion } from 'framer-motion';
import { 
  Cpu, 
  FlaskConical, 
  MessageSquare, 
  Workflow, 
  TrendingUp, 
  ShieldCheck, 
  Radio 
} from 'lucide-react';

const SynergyVisualization = () => {
  const nodes = [
    { name: 'EvaOne', icon: MessageSquare, x: 0, y: -150, color: '#00F2FF' },
    { name: 'Boardroom AI', icon: TrendingUp, x: 130, y: -75, color: '#BC00FF' },
    { name: 'Media', icon: Radio, x: 130, y: 75, color: '#FFB800' },
    { name: 'Racing', icon: Cpu, x: 0, y: 150, color: '#FF3D00' },
    { name: 'Tech Lab', icon: FlaskConical, x: -130, y: 75, color: '#FFFFFF' },
    { name: 'LocalMobile', icon: ShieldCheck, x: -130, y: -75, color: '#00FF9D' },
    { name: 'Automation', icon: Workflow, x: 0, y: 0, color: '#FF00E5' },
  ];

  return (
    <section className="py-32 px-6 bg-brand-void relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="lg:w-1/2">
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-violet font-bold mb-4 block">The Core Loop</span>
          <h2 className="text-4xl md:text-5xl font-display mb-8">ECOSYSTEM SYNERGY</h2>
          <p className="text-brand-slate text-lg leading-relaxed mb-6 font-light">
            Our divisions are not silos; they are interconnected neural pathways. Data from our media division trains our AI models, which power our automation labs, which in turn optimize our software platforms.
          </p>
          <div className="h-[1px] w-20 bg-gradient-to-r from-brand-violet to-transparent mb-6"></div>
          <p className="text-brand-white/80 font-medium">A compounding feedback loop that drives innovation across all sectors.</p>
        </div>

        <div className="lg:w-1/2 flex justify-center py-20 relative">
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
            {/* Center Node (Automation/Parent) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-pink/20 border border-brand-pink/50 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,229,0.3)]"
              >
                <div className="text-[8px] font-display text-brand-pink">MCS CORE</div>
              </motion.div>
            </div>

            {/* Orbiting Nodes */}
            {nodes.map((node, i) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 z-30"
                style={{ 
                   x: `calc(${node.x}px - 50%)`, 
                   y: `calc(${node.y}px - 50%)` 
                }}
              >
                <motion.div 
                   animate={{ y: [0, -5, 0] }}
                   transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                   className="flex flex-col items-center gap-2"
                >
                   <div 
                     className="w-12 h-12 md:w-14 md:h-14 rounded-xl glass border-brand-white/10 flex items-center justify-center group hover:border-brand-white/40 transition-colors"
                     style={{ borderBottom: `2px solid ${node.color}` }}
                   >
                     <node.icon size={20} style={{ color: node.color }} />
                   </div>
                   <span className="text-[8px] uppercase tracking-widest font-bold whitespace-nowrap opacity-60">{node.name}</span>
                </motion.div>
              </motion.div>
            ))}

            {/* Connecting Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
               {nodes.map((node, i) => (
                 <motion.line
                   key={`line-${i}`}
                   x1="50%" y1="50%"
                   x2={`calc(50% + ${node.x}px)`}
                   y2={`calc(50% + ${node.y}px)`}
                   stroke={node.color}
                   strokeWidth="1"
                   initial={{ pathLength: 0 }}
                   whileInView={{ pathLength: 1 }}
                   transition={{ duration: 1.5, delay: 0.5 }}
                 />
               ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SynergyVisualization;
