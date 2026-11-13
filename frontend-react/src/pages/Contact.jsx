import { useState } from 'react';
import { motion } from 'framer-motion';
import SupportChatWidget from '../components/SupportChatWidget';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    manifest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', manifest: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-24">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             Secure Channel
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
            Command Center <span className="text-primary relative inline-block">Support
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 200 20" preserveAspectRatio="none" fill="none">
                <path d="M5,15 Q100,0 195,15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-slate-500 text-lg mt-4 max-w-xl leading-relaxed">
            Initiate a secure transmission. How can we assist your fleet operations today?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Command Form */}
          <motion.div 
            className="lg:col-span-7"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.form 
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 space-y-6 relative overflow-hidden"
            >
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Transmission Sent</h3>
                  <p className="text-slate-500">Our command team has received your message and will respond shortly.</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-bold uppercase tracking-wider">Agent Name</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">person</span>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all outline-none font-medium" 
                      placeholder="Commander Shepard" 
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-bold uppercase tracking-wider">Comms Channel (Email)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">mail</span>
                    <input 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all outline-none font-medium" 
                      placeholder="name@fleet.io" 
                      type="email"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-bold uppercase tracking-wider">Manifest ID (Optional)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">qr_code_2</span>
                  <input 
                    value={formData.manifest}
                    onChange={e => setFormData({...formData, manifest: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all outline-none font-medium" 
                    placeholder="TRK-9920-X" 
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-bold uppercase tracking-wider">Transmission Details</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl h-32 p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 resize-none transition-all outline-none font-medium" 
                  placeholder="Describe the anomaly or request..."
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 h-14 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    Transmitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Transmission
                    <span className="material-symbols-outlined text-base">send</span>
                  </span>
                )}
              </motion.button>
            </motion.form>
          </motion.div>

          {/* Right Column: Live Data & Info */}
          <motion.div 
            className="lg:col-span-5 flex flex-col gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Live Chat Card */}
            <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110"></div>
              <div className="absolute right-6 top-6 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
              <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                  Live Uplink
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Operators are currently online in the global command center. Average response time is &lt; 2 mins.</p>
              <button 
                onClick={() => {
                  window.dispatchEvent(new Event('openSupportChat'));
                }}
                className="text-primary text-sm font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                  Initialize Chat <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </motion.div>

            {/* Details */}
            <motion.div variants={itemVariants} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-start gap-5">
                    <div className="bg-primary/10 p-3.5 rounded-2xl text-primary shrink-0">
                        <span className="material-symbols-outlined text-2xl">share_location</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">HQ Coordinates</p>
                        <p className="text-slate-900 text-lg font-bold leading-snug">
                            Terminal 4, Orbital Dock,<br/>
                            San Francisco, CA 94107
                        </p>
                    </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-start gap-5">
                    <div className="bg-primary/10 p-3.5 rounded-2xl text-primary shrink-0">
                        <span className="material-symbols-outlined text-2xl">call</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Emergency Signal</p>
                        <p className="text-slate-900 text-lg font-bold leading-snug">+1 (800) AERO-HBR</p>
                    </div>
                </div>
            </motion.div>

            {/* System Status Card */}
            <motion.div variants={itemVariants} className="p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 animate-[shimmer_2s_infinite]"></div>
                <p className="text-[10px] text-slate-400 font-mono mb-3 font-bold uppercase">// UPLINK STATUS</p>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "98%" }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full relative"
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse"></div>
                        </motion.div>
                    </div>
                    <span className="text-slate-900 text-sm font-black">98%</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">All communication nodes operational.</p>
            </motion.div>

          </motion.div>
        </div>
      </div>
      
      {/* We mount the chat widget here so it's available on the contact page */}
      <SupportChatWidget />
    </div>
  );
}
