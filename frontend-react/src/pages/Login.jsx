import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [accessKey, setAccessKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: accessKey })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server Error: Received HTML instead of JSON.");
      }

      const data = await response.json();

      if (response.ok && data.success) {
        handleSuccess(data.token);
      } else {
        throw new Error(data.message || "Access Denied");
      }
    } catch (error) {
      console.warn("API Login failed:", error.message);
      setErrorMsg("Invalid credentials or server error. Please try again.");
      triggerError();
    }
  };

  const handleSuccess = (token) => {
    localStorage.setItem('admin_token', token);
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/admin');
    }, 800);
  };

  const triggerError = () => {
    setIsLoading(false);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 flex items-center justify-center min-h-screen relative selection:bg-primary/20 selection:text-slate-900 overflow-hidden">
      
      {/* Light Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/tracking-bg.png')] bg-cover bg-center opacity-10"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-10 md:p-12 rounded-[2rem] w-full max-w-lg relative z-10 text-center space-y-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="size-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm ring-4 ring-white relative group cursor-default">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            <span className="material-symbols-outlined text-4xl relative z-10 transition-transform duration-300 group-hover:rotate-12">
              fingerprint
            </span>
          </div>
          
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Please enter your access credentials to continue.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          <div className="relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Access Key</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                key
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter your key..." 
                className={`w-full bg-slate-50 border ${shake ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 text-slate-900'} rounded-xl pl-12 pr-12 py-4 font-mono text-lg focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:text-sm shadow-sm ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
                disabled={isLoading || isSuccess}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer outline-none"
                tabIndex="-1"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
              }
            `}</style>
          </div>
          
          {/* Status Message */}
          <div className="h-4">
            {errorMsg && !isLoading && !isSuccess && (
              <p className="text-red-500 text-xs font-semibold flex items-center gap-1 animate-[fadeInUp_0.3s_ease-out]">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {errorMsg}
              </p>
            )}
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(13,242,223,0.25)] flex items-center justify-center gap-2 overflow-hidden relative group cursor-pointer hover:cursor-pointer
                ${isSuccess 
                  ? 'bg-[#00ffa3] text-slate-900 shadow-[0_8px_20px_rgba(0,255,163,0.3)]' 
                  : 'bg-primary text-white hover:shadow-[0_8px_25px_rgba(13,242,223,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                }
                ${isLoading && !isSuccess ? 'opacity-70 cursor-not-allowed hover:cursor-not-allowed' : ''}
              `}
            >
              {isSuccess ? (
                <span className="flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                  <span className="material-symbols-outlined">check_circle</span>
                  Access Granted
                </span>
              ) : isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span className="relative z-10 text-slate-900">Sign In to Dashboard</span>
                  <span className="material-symbols-outlined text-sm relative z-10 text-slate-900 transition-transform group-hover:translate-x-1">arrow_forward</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                </>
              )}
            </button>
          </div>

          {/* Forgotten Password Section */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Having trouble signing in?{' '}
              <a href="#" className="text-primary hover:text-primary-light font-bold hover:underline underline-offset-2 transition-colors cursor-pointer">
                Reset Access Key
              </a>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
