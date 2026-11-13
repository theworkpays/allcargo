import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const liveTrackingData = [
  { id: 'AH-9021', from: 'Lagos, NG', to: 'Rotterdam, NL', eta: 'May 28, 2026', progress: '65%' },
  { id: 'AH-4432', from: 'Tokyo, JP', to: 'Los Angeles, US', eta: 'Jun 02, 2026', progress: '42%' },
  { id: 'AH-7719', from: 'London, UK', to: 'Dubai, UAE', eta: 'May 30, 2026', progress: '88%' }
];

const TrackingCardUI = ({ data }) => (
  <div className="flex flex-col gap-3.5">
    {/* Header */}
    <div className="flex justify-between items-center">
       <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">{data.id}</span>
       </div>
       <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shadow-sm">
         <span className="material-symbols-outlined text-[12px] text-primary animate-pulse">satellite_alt</span>
         <span className="text-primary text-[9px] font-extrabold uppercase tracking-widest">Live</span>
       </div>
    </div>
    
    {/* Route Map */}
    <div className="flex flex-col gap-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100/80 shadow-inner">
       <div className="flex justify-between items-center text-xs font-bold text-slate-700">
         <span className="w-[40%] truncate">{data.from}</span>
         <motion.span 
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="material-symbols-outlined text-primary text-[18px]"
         >
           local_shipping
         </motion.span>
         <span className="w-[40%] truncate text-right">{data.to}</span>
       </div>
       {/* Progress Line */}
       <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5 relative">
         <motion.div 
           initial={{ width: "0%" }}
           animate={{ width: data.progress }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
         >
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/60 animate-[pulse_1s_ease-in-out_infinite]"></div>
         </motion.div>
       </div>
    </div>
    
    {/* Footer */}
    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
       <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> ETA: {data.eta}</span>
       <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[9px]">{data.progress} completed</span>
    </div>
  </div>
);

const MobileTrackingWidget = ({ data, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="lg:hidden absolute z-20 bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-8 sm:bottom-12 w-[90%] max-w-[320px] sm:w-72"
  >
    <div className="relative rounded-[1.25rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] group p-4 sm:p-5">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/80 z-0"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, filter: 'blur(4px)', x: 15 }}
            animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', x: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <TrackingCardUI data={data} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
);

const DesktopStackCarousel = ({ cardIndex }) => {
  return (
    <div className="hidden lg:flex absolute inset-0 z-20 items-center justify-center">
      {liveTrackingData.map((data, i) => {
        const offset = (i - (cardIndex % 3) + 3) % 3;
        const isActive = offset === 0;
        const isNext = offset === 1;
        
        // Check if this card was the active one in the previous step to trigger the circular swing
        const wasActive = cardIndex > 0 && (i === (cardIndex - 1 + 3) % 3);

        // Define the target positions for a sleek diagonal stack
        const targetX = isActive ? -120 : isNext ? -30 : 60;
        const targetY = isActive ? 120 : isNext ? 30 : -60;
        const targetScale = isActive ? 1.05 : isNext ? 0.9 : 0.75;
        const targetZ = isActive ? 30 : isNext ? 20 : 10;
        const targetOpacity = isActive ? 1 : isNext ? 1 : 0.6;

        // Keyframes for the circular swing out motion
        const xAnim = wasActive ? [-120, 120, 60] : targetX;
        const yAnim = wasActive ? [120, 180, -60] : targetY;
        const rotateAnim = wasActive ? [0, 20, 0] : isActive ? 0 : isNext ? -3 : 3;

        return (
          <motion.div
            key={data.id}
            className="absolute w-72 origin-center"
            initial={false}
            animate={{
              x: xAnim,
              y: yAnim,
              scale: targetScale,
              rotate: rotateAnim,
              zIndex: targetZ,
              opacity: targetOpacity
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeInOut"
            }}
          >
            <div className="relative rounded-[1.25rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group p-5 bg-white/70 backdrop-blur-xl border border-white/80">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <TrackingCardUI data={data} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % liveTrackingData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTrack = async () => {
    const id = trackId.trim().toUpperCase();
    if (!id) return;
    
    try {
      const res = await fetch(`/api/shipments?id=${id}`);
      const found = res.ok;
      const foundLive = liveTrackingData.find(item => item.id === id);

      if (found || foundLive) { 
        navigate(`/tracking?id=${id}`);
      } else {
        setError(true);
        setTrackId('');
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative w-full max-w-[1600px] mx-auto px-5 lg:px-12 pt-2 pb-6 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16 flex flex-col-reverse lg:flex-row items-center gap-4 lg:gap-12">
        
        {/* Left Content */}
        <div className="w-full lg:w-[55%] flex flex-col items-start text-left z-10 lg:pr-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary text-[8px] sm:text-xs font-bold tracking-widest uppercase mb-3 sm:mb-6"
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"></div>
            SMARTER LOGISTICS
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-2 sm:mb-6"
          >
            Track Every <br className="hidden sm:block" />Shipment.<br />
            <span className="text-primary relative inline-block">
              In Real Time.
              {/* Green underline SVG */}
              <svg className="absolute w-full h-2 sm:h-4 -bottom-0.5 sm:-bottom-1 left-0 text-primary" viewBox="0 0 200 20" preserveAspectRatio="none" fill="none">
                <path d="M5,15 Q100,0 195,15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="text-sm sm:text-lg text-slate-500 max-w-xl mb-6 sm:mb-10 leading-relaxed"
          >
            Monitor fleet activity and get AI-powered insights to deliver smarter and faster.
          </motion.p>

          {/* Tracking Input Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="w-full max-w-2xl bg-white p-1.5 sm:p-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center mb-6 sm:mb-16 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,147,83,0.12)] hover:-translate-y-1 hover:border-primary/20 focus-within:shadow-[0_12px_40px_rgba(15,147,83,0.2)] focus-within:-translate-y-1 focus-within:border-primary/50"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 ml-1">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">inventory_2</span>
            </div>
            <input 
              type="text" 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              className={`flex-grow border-none bg-transparent px-3 sm:px-4 text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 ${error ? 'placeholder-red-400 text-red-500' : ''}`}
              placeholder={error ? "INVALID ID" : "Enter Shipment ID..."}
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrack} 
              className="hidden sm:flex cursor-pointer h-12 sm:h-14 items-center gap-2 rounded-xl bg-primary px-6 sm:px-8 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-light hover:shadow-primary/50 shrink-0"
            >
              <span>Track Shipment</span>
              <motion.span 
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="material-symbols-outlined text-lg"
              >
                arrow_forward
              </motion.span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrack} 
              className="flex sm:hidden cursor-pointer h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-light hover:shadow-primary/50 shrink-0"
            >
              <motion.span 
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="material-symbols-outlined"
              >
                arrow_forward
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="grid grid-cols-3 gap-2 sm:gap-8 w-full"
          >
            {/* Feature 1 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[14px] sm:text-[24px]">schedule</span>
              </div>
              <div>
                <h4 className="font-bold text-[9px] sm:text-sm text-slate-900 leading-tight">Real-Time<br className="sm:hidden" /> Tracking</h4>
                <p className="hidden sm:block text-xs text-slate-500 mt-1 leading-relaxed">Live updates across<br/>all shipments</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[14px] sm:text-[24px]">route</span>
              </div>
              <div>
                <h4 className="font-bold text-[9px] sm:text-sm text-slate-900 leading-tight">Smart<br className="sm:hidden" /> Routing</h4>
                <p className="hidden sm:block text-xs text-slate-500 mt-1 leading-relaxed">AI-optimized routes<br/>for efficiency</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[14px] sm:text-[24px]">verified_user</span>
              </div>
              <div>
                <h4 className="font-bold text-[9px] sm:text-sm text-slate-900 leading-tight">Secure<br className="sm:hidden" /> & Reliable</h4>
                <p className="hidden sm:block text-xs text-slate-500 mt-1 leading-relaxed">Enterprise-grade security<br/>you can trust</p>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Right Content - Visuals */}
        <div className="w-full lg:w-[45%] relative h-[220px] sm:h-[400px] lg:h-[550px] lg:mt-0 z-0 flex items-center justify-center">
           <motion.img 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              src="/hero-bg.png" 
              alt="Logistics Fleet" 
              className="absolute inset-0 w-full h-full object-contain scale-[1.10] lg:scale-[1.25] lg:translate-x-4 lg:translate-y-4 origin-center lg:origin-right transform"
           />
           {/* Mobile Tracking Card Overlay */}
           <MobileTrackingWidget 
             data={liveTrackingData[cardIndex]} 
             index={cardIndex} 
           />
           
           {/* Desktop Stack Carousel */}
           <DesktopStackCarousel cardIndex={cardIndex} />
        </div>

      </section>

      {/* Trusted Partners Section */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-8 sm:py-10 relative z-10 overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left whitespace-nowrap shrink-0">
            Trusted by global leaders
          </p>
          
          {/* Marquee Container */}
          <div className="w-full relative flex overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)]">
             <motion.div
               animate={{ x: ["0%", "-50%"] }}
               transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
               className="flex items-center w-max"
             >
               {[...Array(2)].map((_, i) => (
                 <div key={i} className="flex items-center gap-12 sm:gap-20 px-6 sm:px-10">
                   {/* MAERSK */}
                   <div className="flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tighter opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-blue-600 transition-all duration-300 cursor-pointer">
                     <span className="material-symbols-outlined text-[28px] sm:text-3xl text-blue-400">star</span>
                     MAERSK
                   </div>
                   {/* DHL */}
                   <div className="flex items-center font-black italic text-2xl sm:text-3xl tracking-tighter opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-red-600 transition-all duration-300 cursor-pointer">
                     <span className="text-yellow-500 mr-1">D</span>HL
                   </div>
                   {/* CMA CGM */}
                   <div className="flex items-center font-black text-xl sm:text-2xl tracking-tighter opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-indigo-800 transition-all duration-300 cursor-pointer">
                     CMA CGM
                   </div>
                   {/* EVERGREEN */}
                   <div className="flex items-center font-black text-xl sm:text-2xl tracking-wider opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-green-700 transition-all duration-300 cursor-pointer">
                     EVERGREEN
                   </div>
                   {/* MSC */}
                   <div className="flex flex-col items-center font-black text-sm sm:text-base tracking-tighter leading-none opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-yellow-600 transition-all duration-300 cursor-pointer">
                     <span>m</span>
                     <span>sc</span>
                   </div>
                   {/* +250 more */}
                   <div className="text-sm font-bold text-slate-400 opacity-60">
                     +250 more
                   </div>
                 </div>
               ))}
             </motion.div>
          </div>
        </div>
      </section>


      {/* Stats Section - Light Theme */}
      <section className="bg-white py-12 relative overflow-hidden z-10 border-t border-slate-100">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12 relative z-10">
          <div className="mb-8">
             <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-2">Network Analytics</h2>
             <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Real-Time Operations</h3>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: 'Live Throughput', subtitle: 'Network Assets', value: '14,021', icon: 'package_2', progress: '82%', label: 'Capacity' },
              { title: 'Reliability Index', subtitle: 'Delivery Precision', value: '99.98', icon: 'verified', progress: '99%', label: 'SLA Compliance' },
              { title: 'Global Footprint', subtitle: 'Active Hubs', value: '240', icon: 'language', progress: '75%', label: 'Coverage' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group bg-white p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,147,83,0.08)] border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{stat.title}</p>
                    <h3 className="text-slate-800 text-lg font-bold">{stat.subtitle}</h3>
                  </div>
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                </div>
                <div className="relative mb-4">
                  <p className="font-display text-5xl font-black text-slate-900 tracking-tighter">
                    {stat.value}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>{stat.label}</span>
                    <span className="text-primary">{stat.progress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.progress }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-slate-50/50 py-24 border-t border-slate-100 relative">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="text-primary font-bold tracking-widest uppercase text-xs mb-3"
             >
               Our Services
             </motion.h2>
             <motion.h3 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ delay: 0.1 }}
               className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight"
             >
               End-to-End Logistics Solutions
             </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'Air Freight', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800', desc: 'Next-flight-out services and expedited air cargo solutions for time-critical shipments.' },
               { title: 'Ocean Freight', img: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=800', desc: 'FCL and LCL shipping with real-time vessel tracking across all major global trade lanes.' },
               { title: 'Road Transport', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800', desc: 'Domestic and cross-border trucking with integrated GPS visibility from pickup to delivery.' }
             ].map((svc, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ delay: idx * 0.2, duration: 0.6 }}
                 className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group"
               >
                 <div className="h-60 overflow-hidden relative">
                   <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                   <img src={svc.img} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                 </div>
                 <div className="p-8">
                   <h4 className="text-xl font-bold text-slate-900 mb-3">{svc.title}</h4>
                   <p className="text-slate-500 text-sm leading-relaxed mb-6">{svc.desc}</p>
                   <button className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer">
                     Learn more <span className="material-symbols-outlined text-base">arrow_forward</span>
                   </button>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="bg-slate-950 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold tracking-widest uppercase text-xs mb-3"
              >
                Industry Solutions
              </motion.h2>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-white tracking-tight"
              >
                Tailored for your sector
              </motion.h3>
            </div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white border border-white/20 rounded-full px-6 py-3 font-bold hover:bg-white/10 transition-colors flex items-center gap-2 whitespace-nowrap w-fit cursor-pointer"
            >
              View all industries <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'medical_services', title: 'Healthcare', desc: 'Temperature-controlled cold chain logistics for critical pharma and medical devices.' },
              { icon: 'shopping_bag', title: 'E-Commerce', desc: 'High-volume last-mile delivery and reverse logistics for global retail brands.' },
              { icon: 'directions_car', title: 'Automotive', desc: 'Just-in-time supply chain management for assembly lines and aftermarket parts.' },
              { icon: 'memory', title: 'Technology', desc: 'High-security transport and white-glove handling for sensitive electronic components.' }
            ].map((industry, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.15 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800 transition-colors group cursor-pointer"
              >
                <div className="size-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">{industry.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{industry.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{industry.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Explore <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200" alt="Global Warehouse" className="w-full h-[500px] object-cover rounded-3xl shadow-2xl" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Global Infrastructure</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Connecting Continents Seamlessly</h3>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Our state-of-the-art facilities and strategic partnerships allow us to move your cargo quickly and securely anywhere in the world. Experience complete transparency with our advanced tracking platform.
            </p>
            <ul className="space-y-4 mb-10">
              {['24/7 Dedicated Support', 'Customs Clearance Expertise', 'Temperature-Controlled Storage', 'AI-Driven Supply Chain Insights'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors cursor-pointer">
              Explore Our Network
            </button>
          </motion.div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="bg-slate-50 py-24 relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <h2 className="text-[#0F9353] font-bold tracking-widest uppercase text-xs">Sustainability</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Pioneering Green Logistics for a Better Tomorrow
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              We are committed to reducing our carbon footprint across all operations. From investing in Sustainable Aviation Fuel (SAF) to electrifying our last-mile delivery fleets, our goal is clear: Net-Zero emissions by 2040.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-6">
               <div>
                 <h4 className="font-display text-4xl font-black text-slate-900 mb-2">45%</h4>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Electric Fleet by 2028</p>
               </div>
               <div>
                 <h4 className="font-display text-4xl font-black text-slate-900 mb-2">Zero</h4>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Emissions Target 2040</p>
               </div>
            </div>
            
            <div className="pt-6">
              <button className="bg-white border-2 border-[#0F9353] text-[#0F9353] px-8 py-4 rounded-xl font-bold hover:bg-[#0F9353] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-2">
                Our Environmental Report <span className="material-symbols-outlined text-sm">eco</span>
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative h-[400px] sm:h-[500px]"
          >
            <div className="absolute inset-0 bg-[#0F9353]/10 rounded-[2.5rem] rotate-3 scale-105"></div>
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200" alt="Green Logistics Forest" className="w-full h-full object-cover rounded-[2.5rem] relative z-10 shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4">
               <div className="size-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-2xl">energy_savings_leaf</span>
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase">Carbon Offset</p>
                 <p className="font-bold text-slate-900">1.2M Tons Saved</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest News & Insights */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold tracking-widest uppercase text-xs mb-3"
              >
                Press & Insights
              </motion.h2>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight"
              >
                Latest from Allcargo
              </motion.h3>
            </div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-slate-900 border-2 border-slate-900 rounded-full px-6 py-3 font-bold hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap w-fit cursor-pointer"
            >
              View Newsroom <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tag: 'Press Release', date: 'August 08, 2026', title: 'Allcargo expands autonomous drone delivery network in Northern Europe.', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800' },
              { tag: 'Industry Insight', date: 'July 24, 2026', title: 'How AI is predicting supply chain bottlenecks before they happen.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800' },
              { tag: 'Company News', date: 'July 15, 2026', title: 'We have secured 100% sustainable aviation fuel for all transatlantic cargo flights.', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800' }
            ].map((article, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="h-56 overflow-hidden rounded-3xl mb-6 relative">
                   <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-900">
                     {article.tag}
                   </div>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{article.date}</p>
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">{article.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F9353]"></div>
        <div className="absolute inset-0 bg-[url('/tracking-bg.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="mx-auto w-full max-w-4xl px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
          >
            Ready to optimize your supply chain?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl mb-10 text-white/90"
          >
            Join thousands of businesses that trust Allcargo for their global logistics.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto">
              Get a Quote
            </button>
            <button className="bg-black/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-black/30 transition-colors cursor-pointer w-full sm:w-auto">
              Contact Sales
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
