import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
               <span className="material-symbols-outlined text-[14px]">flag</span>
               Our Mission
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
              Rewiring Global Trade for the <span className="text-primary">Modern Era</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              Allcargo was founded with a single, audacious goal: to eliminate the black box of global logistics. By combining AI-driven predictive analytics with real-time satellite tracking, we're building the nervous system of modern trade.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/tracking" className="bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2">
                Track a Shipment <span className="material-symbols-outlined">radar</span>
              </Link>
              <Link to="/contact" className="bg-white border border-slate-200 text-slate-700 hover:text-primary px-8 py-4 rounded-xl font-bold transition-colors flex items-center gap-2">
                Contact Operations <span className="material-symbols-outlined">support_agent</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image / Video Placeholder */}
      <section className="px-6 lg:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl relative group"
           >
             <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2000" 
               alt="Allcargo Global Operations Hub" 
               className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
             />
             <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl z-20 flex items-center gap-4 shadow-xl">
                <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">satellite_alt</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Live Satellite Uplink</p>
                  <p className="font-bold text-slate-900">Global Operations Center</p>
                </div>
             </div>
           </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Core Philosophy</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Built on Transparency</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: 'visibility', title: 'Absolute Visibility', desc: 'No more guessing where your freight is. We provide millimeter-level tracking from origin to destination across sea, air, and land.' },
              { icon: 'speed', title: 'Mach-Speed Execution', desc: 'Our predictive routing engine reroutes shipments automatically around weather and port congestion, saving days of transit time.' },
              { icon: 'verified_user', title: 'Unbreakable Trust', desc: 'Backed by enterprise-grade encryption and immutable ledgers, ensuring your supply chain data remains secure and compliant.' }
            ].map((value, idx) => (
              <motion.div key={idx} variants={itemVariants} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="size-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-2xl">{value.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h4>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Leadership</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">The Minds Behind Allcargo</h3>
            </div>
            <Link to="/contact" className="text-slate-900 border-2 border-slate-900 rounded-full px-6 py-3 font-bold hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap w-fit">
              Join our team <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { name: 'Sarah Jenkins', role: 'Chief Executive Officer', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },
              { name: 'David Chen', role: 'Head of AI Operations', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600' },
              { name: 'Elena Rodriguez', role: 'Global Fleet Commander', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600' },
              { name: 'Marcus Thorne', role: 'VP of Infrastructure', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600' }
            ].map((member, idx) => (
              <motion.div key={idx} variants={itemVariants} className="group cursor-pointer">
                <div className="h-72 rounded-3xl overflow-hidden mb-4 relative bg-slate-200">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <div className="flex gap-3 text-white">
                      <span className="material-symbols-outlined hover:text-primary transition-colors">language</span>
                      <span className="material-symbols-outlined hover:text-primary transition-colors">mail</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{member.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
