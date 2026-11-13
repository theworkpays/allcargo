import React from 'react';

export default function AdminSidebar({ 
  currentView, 
  setCurrentView, 
  handleLogout, 
  hasUnreadSupport 
}) {
  const views = [
    { id: 'overview', icon: 'grid_view', label: 'System Overview' },
    { id: 'shipments', icon: 'radar', label: 'Neural Ledger' },
    { id: 'visitors', icon: 'public', label: 'Live Signals', hasPulse: true },
    { id: 'support', icon: 'forum', label: 'Comms Uplink', hasBadge: hasUnreadSupport }
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white h-screen shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100">
      {/* Logo Area */}
      <div className="h-24 flex items-center gap-3 px-8 shrink-0">
        <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
          <span className="material-symbols-outlined text-2xl">hub</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-slate-900 tracking-tight text-xl">Allcargo</h1>
          <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-0.5">Command_OS v2.0</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-4">Main Terminal</div>
        
        {views.map(view => (
          <button 
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-left relative cursor-pointer
              ${currentView === view.id 
                ? 'bg-green-50 text-green-700 font-bold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 font-medium'
              }
            `}
          >
            <span className={`material-symbols-outlined transition-colors ${currentView === view.id ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {view.icon}
            </span>
            <span className="text-sm">
              {view.label}
            </span>
            
            {currentView === view.id && view.id !== 'support' && (
              <span className="absolute right-4 size-2 bg-green-500 rounded-full"></span>
            )}
            {view.hasPulse && currentView !== view.id && (
              <span className="absolute right-4 size-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
            {view.hasBadge && (
              <span className="absolute right-4 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">NEW</span>
            )}
          </button>
        ))}
        
        <div className="mt-8 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">System Options</div>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-left text-slate-500 hover:bg-slate-50 font-medium cursor-pointer">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600">settings</span>
          <span className="text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-left text-slate-500 hover:bg-slate-50 font-medium cursor-pointer">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600">group</span>
          <span className="text-sm">Users & Roles</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-left text-slate-500 hover:bg-slate-50 font-medium cursor-pointer">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600">history</span>
          <span className="text-sm">Audit Logs</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 border border-red-100 bg-white hover:bg-red-50 text-red-500 text-xs font-bold py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">power_settings_new</span>
          TERMINATE SESSION
        </button>
      </div>
    </aside>
  );
}
