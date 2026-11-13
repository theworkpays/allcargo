import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Active Hubs', value: '240', suffix: '+' },
  { label: 'Countries Covered', value: '185', suffix: '' },
  { label: 'Fleet Vehicles', value: '12,500', suffix: '+' },
  { label: 'Daily Shipments', value: '1.2M', suffix: '' }
];

const hubs = [
  { city: 'Rotterdam, NL', type: 'Primary Ocean Hub', status: 'Optimal', delay: 'None' },
  { city: 'Singapore, SG', type: 'Asia-Pacific Gateway', status: 'Busy', delay: '+2 hrs' },
  { city: 'Los Angeles, US', type: 'West Coast Distribution', status: 'Optimal', delay: 'None' },
  { city: 'Frankfurt, DE', type: 'European Air Freight', status: 'Optimal', delay: 'None' },
  { city: 'Dubai, UAE', type: 'Middle East Cross-Dock', status: 'Optimal', delay: 'None' },
  { city: 'Panama City, PA', type: 'Americas Transit', status: 'Congested', delay: '+5 hrs' }
];

export default function Network() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 relative overflow-hidden">
      {/* Dynamic Network Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 size-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite_reverse]"></div>
        
        {/* Simple grid overlay */}
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Header */}
      <section className="relative z-10 pt-24 pb-12 px-6 lg:px-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20 shadow-sm">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
             </span>
             Live Network Map
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 text-slate-900">
            Connecting <span className="text-primary drop-shadow-sm">Continents.</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-8 font-medium">
            Our global infrastructure is built for scale, resilience, and speed. View real-time telemetry from our primary hubs across the world.
          </p>
          <Link to="/tracking" className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/20 inline-flex items-center gap-2 border border-slate-800">
            Track in Network <span className="material-symbols-outlined">track_changes</span>
          </Link>
        </motion.div>
      </section>

      {/* Network Stats */}
      <section className="relative z-10 py-12 px-6 lg:px-12 border-y border-slate-200 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <h4 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 drop-shadow-sm">
                {stat.value}<span className="text-primary">{stat.suffix}</span>
              </h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hub Infrastructure Map/List */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-12">
          
          {/* Visual Map Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full xl:w-2/3 h-[400px] md:h-[600px] bg-slate-100 rounded-3xl border border-slate-200 relative overflow-hidden shadow-2xl group"
          >
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-60 mix-blend-multiply group-hover:opacity-80 transition-opacity duration-1000 filter grayscale contrast-125"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
             
             {/* Simulated map nodes */}
             <div className="absolute top-[40%] left-[20%] size-3 bg-primary rounded-full shadow-[0_0_15px_#0df2df] animate-pulse"></div>
             <div className="absolute top-[35%] left-[50%] size-4 bg-primary rounded-full shadow-[0_0_20px_#0df2df] animate-pulse" style={{ animationDelay: '0.5s'}}></div>
             <div className="absolute top-[60%] left-[75%] size-3 bg-primary rounded-full shadow-[0_0_15px_#0df2df] animate-pulse" style={{ animationDelay: '1s'}}></div>
             <div className="absolute top-[45%] left-[80%] size-2 bg-slate-900 rounded-full shadow-[0_0_10px_#000] animate-pulse" style={{ animationDelay: '1.5s'}}></div>

             <div className="absolute bottom-8 left-8 right-8">
               <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-lg">
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Global Traffic</p>
                   <p className="text-slate-900 font-mono text-sm font-bold">Processing 4,291 concurrent shipments</p>
                 </div>
                 <div className="h-10 w-32 bg-slate-100 rounded flex items-end justify-between p-1 gap-1 border border-slate-200">
                   {[40, 60, 45, 80, 50, 75, 90, 65, 55, 85].map((h, i) => (
                     <motion.div 
                       key={i} 
                       className="w-full bg-primary rounded-t-sm" 
                       initial={{ height: "10%" }}
                       animate={{ height: `${h}%` }}
                       transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: i * 0.1 }}
                     />
                   ))}
                 </div>
               </div>
             </div>
          </motion.div>

          {/* Hub List */}
          <div className="w-full xl:w-1/3 flex flex-col gap-4 h-[400px] md:h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl font-bold text-slate-900 mb-4 sticky top-0 bg-slate-50 py-2 z-10 border-b border-slate-200">
              Primary Hub Status
            </h3>
            
            {hubs.map((hub, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-slate-900 font-bold text-lg group-hover:text-primary transition-colors">{hub.city}</h4>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    hub.status === 'Optimal' ? 'bg-green-100 text-green-700' :
                    hub.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {hub.status}
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-4 font-medium">{hub.type}</p>
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                  <span className="text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Avg Delay
                  </span>
                  <span className={hub.delay === 'None' ? 'text-slate-700 font-bold' : 'text-yellow-600 font-bold'}>
                    {hub.delay}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 1);
        }
      `}} />
    </div>
  );
}
