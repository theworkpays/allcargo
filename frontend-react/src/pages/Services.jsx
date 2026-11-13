import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const servicesData = [
  {
    id: 'air',
    title: 'Air Freight',
    tagline: 'Speed without compromise.',
    icon: 'flight_takeoff',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200',
    description: 'When time is the ultimate currency, our global air freight network delivers. We prioritize speed and security, offering next-flight-out services and chartered cargo flights for high-value and time-critical assets.',
    features: ['Next-Flight-Out Availability', 'Temperature-Controlled Cargo', 'Charter Services', 'Real-time Altitude & Temp Tracking']
  },
  {
    id: 'ocean',
    title: 'Ocean Freight',
    tagline: 'The backbone of global trade.',
    icon: 'directions_boat',
    image: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=1200',
    description: 'Navigate global waters with unparalleled efficiency. From FCL (Full Container Load) to LCL (Less than Container Load), our ocean freight solutions are optimized by AI for the fastest routes and most secure port handoffs.',
    features: ['FCL & LCL Shipping', 'Port-to-Door Delivery', 'Customs Clearance Integration', 'Dynamic Vessel Rerouting']
  },
  {
    id: 'road',
    title: 'Road Transport',
    tagline: 'Last-mile precision.',
    icon: 'local_shipping',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200',
    description: 'Our extensive ground fleet bridges the gap between ports and final destinations. Equipped with IoT sensors, our trucks provide continuous telemetry data, ensuring your cargo is never out of sight.',
    features: ['Domestic & Cross-Border', 'IoT Telemetry Tracking', 'Expedited Hotshot Delivery', 'Eco-Friendly EV Fleet Options']
  },
  {
    id: 'warehouse',
    title: 'Smart Warehousing',
    tagline: 'Next-gen storage solutions.',
    icon: 'warehouse',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    description: 'More than just storage. Our smart hubs act as automated fulfillment centers. Robotics and predictive AI ensure inventory is optimally placed, picked, and packed before bottlenecks occur.',
    features: ['Robotic Fulfillment', 'Predictive Inventory Placement', 'Cold-Chain Storage', 'Automated Quality Control']
  }
];

export default function Services() {
  const [activeService, setActiveService] = useState(servicesData[0]);

  return (
    <div className="bg-white min-h-screen relative">
      {/* Header */}
      <section className="pt-24 pb-12 px-6 lg:px-12 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
               <span className="material-symbols-outlined text-[14px]">view_cozy</span>
               Our Capabilities
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              End-to-End <span className="text-primary">Logistics</span> Solutions
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
              We engineer supply chains that are resilient, fast, and completely transparent. Explore our core services designed to move the modern world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Services Showcase */}
      <section className="py-16 px-6 lg:px-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Navigation/List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {servicesData.map((service) => (
              <motion.button
                key={service.id}
                onClick={() => setActiveService(service)}
                className={`flex items-center gap-4 p-6 rounded-2xl text-left transition-all duration-300 border-2 cursor-pointer ${
                  activeService.id === service.id 
                    ? 'bg-white border-primary shadow-xl shadow-primary/10' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md'
                }`}
              >
                <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                  activeService.id === service.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${activeService.id === service.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-400">{service.tagline}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Details/Image Panel */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeService.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 transition-transform group-hover:scale-125 duration-700"></div>
                
                <div className="w-full h-[300px] rounded-2xl overflow-hidden mb-8 relative">
                   <div className="absolute inset-0 bg-slate-900/10 z-10"></div>
                   <img src={activeService.image} alt={activeService.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
                   <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1 shadow-sm">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                     </span>
                     Active Service Line
                   </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-4xl">{activeService.icon}</span>
                  {activeService.title}
                </h2>
                
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  {activeService.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeService.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-primary bg-primary/10 rounded-full p-1 text-sm">check</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 border-t border-slate-100 pt-8">
                  <Link to="/contact" className="bg-slate-900 hover:bg-primary text-white px-8 py-4 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-2">
                    Request a Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Analytics/Tracking Integration CTA */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
           <div className="absolute top-1/2 right-10 -translate-y-1/2 text-white/5 pointer-events-none">
             <span className="material-symbols-outlined text-[300px]">hub</span>
           </div>
           
           <div className="relative z-10 max-w-2xl">
             <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Unified tracking across all modes.</h2>
             <p className="text-slate-400 text-lg mb-10">Whether your cargo is in the air, on the sea, or over the road, track it from a single, intuitive dashboard with Allcargo.</p>
             <Link to="/tracking" className="bg-primary hover:bg-primary-light text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg transition-colors cursor-pointer inline-flex items-center gap-2">
                Launch Live Tracking <span className="material-symbols-outlined">launch</span>
             </Link>
           </div>
        </div>
      </section>

    </div>
  );
}
