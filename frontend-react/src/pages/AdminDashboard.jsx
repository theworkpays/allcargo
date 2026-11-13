import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import ManifestModal from '../components/ManifestModal';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';

// Data Keys
const DB_KEY = "allcargo_shipments";
const VISITOR_KEY = "allcargo_visitors";
const CHAT_KEY = "allcargo_chats";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const geocodeCache = {
  "london": [-0.1276, 51.5074],
  "shanghai": [121.4737, 31.2304],
  "uk": [-0.1276, 51.5074],
  "cn": [121.4737, 31.2304],
  "new york": [-74.0060, 40.7128],
  "tokyo": [139.6917, 35.6895],
  "los angeles": [-118.2437, 34.0522],
  "dubai": [55.2708, 25.2048],
  "paris": [2.3522, 48.8566],
  "berlin": [13.4050, 52.5200],
  "sydney": [151.2093, -33.8688]
};

const getCoordinates = async (query) => {
  if (!query) return [0,0];
  
  const coordMatch = query.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (coordMatch) {
     return [parseFloat(coordMatch[2]), parseFloat(coordMatch[1])];
  }

  const normalized = query.toLowerCase().trim();
  if (geocodeCache[normalized]) return geocodeCache[normalized];
  
  for (let key in geocodeCache) {
      if (normalized.includes(key)) return geocodeCache[key];
  }

  try {
     const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
     const data = await res.json();
     if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        geocodeCache[normalized] = coords;
        return coords;
     }
  } catch (e) {
     console.error("Geocoding failed for", query);
  }
  
  geocodeCache[normalized] = [0,0];
  return [0,0];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());
  
  // Data State
  const [shipments, setShipments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [chats, setChats] = useState({});
  const [trafficHistory, setTrafficHistory] = useState(new Array(20).fill(0));
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItemData, setEditItemData] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [logs, setLogs] = useState([]);
  const [mapCoords, setMapCoords] = useState({ origin: [0,0], dest: [0,0], current: null });
  const [planePos, setPlanePos] = useState([0,0]);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [targetPosition, setTargetPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // Smooth Pan/Spin Animation
  useEffect(() => {
    let frame;
    const animatePan = () => {
       setPosition(prev => {
          const dx = targetPosition.coordinates[0] - prev.coordinates[0];
          const dy = targetPosition.coordinates[1] - prev.coordinates[1];
          const dz = targetPosition.zoom - prev.zoom;
          
          if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(dz) < 0.01) {
             return targetPosition;
          }
          
          return {
             coordinates: [prev.coordinates[0] + dx * 0.08, prev.coordinates[1] + dy * 0.08],
             zoom: prev.zoom + dz * 0.08
          };
       });
       frame = requestAnimationFrame(animatePan);
    };
    frame = requestAnimationFrame(animatePan);
    return () => cancelAnimationFrame(frame);
  }, [targetPosition]);

  // Map Animation Effects
  useEffect(() => {
    if (selectedShipment) {
      const fetchAllCoords = async () => {
         const o = await getCoordinates(selectedShipment.origin);
         const d = await getCoordinates(selectedShipment.destination);
         let c = null;
         if (selectedShipment.location && selectedShipment.location !== selectedShipment.origin && selectedShipment.location !== selectedShipment.destination) {
             c = await getCoordinates(selectedShipment.location);
         }
         setMapCoords({ origin: o, dest: d, current: c });
         
         const midLng = (o[0] + d[0]) / 2;
         const midLat = (o[1] + d[1]) / 2;
         setTargetPosition({ coordinates: [midLng, midLat], zoom: 3 });
      }
      fetchAllCoords();
    } else {
         setTargetPosition({ coordinates: [0, 0], zoom: 1 });
    }
  }, [selectedShipment, shipments]);

  useEffect(() => {
     if (!selectedShipment) return;
     
     const isTransit = selectedShipment.status === 'In Transit';
     
     if (!isTransit) {
         if (mapCoords.current && mapCoords.current[0] !== 0) {
            setPlanePos(mapCoords.current);
         } else if (selectedShipment.status === 'Delivered') {
            setPlanePos(mapCoords.dest);
         } else {
            setPlanePos([(mapCoords.origin[0]+mapCoords.dest[0])/2, (mapCoords.origin[1]+mapCoords.dest[1])/2]);
         }
         return;
     }

     if (mapCoords.current && mapCoords.current[0] !== 0) {
        setPlanePos(mapCoords.current);
        return;
     }
     
     let start = null;
     let animationFrame;
     const duration = 8000;
     
     const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = ((timestamp - start) % duration) / duration; 
        
        const [oLng, oLat] = mapCoords.origin;
        const [dLng, dLat] = mapCoords.dest;
        
        const lng = oLng + (dLng - oLng) * progress;
        const lat = oLat + (dLat - oLat) * progress;
        
        setPlanePos([lng, lat]);
        animationFrame = requestAnimationFrame(animate);
     };
     
     animationFrame = requestAnimationFrame(animate);
     return () => cancelAnimationFrame(animationFrame);
  }, [mapCoords, selectedShipment]);

  // Init and Sync
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const checkInit = async () => {
      try {
        const res = await fetch('/api/shipments');
        const data = await res.json();
        if (data.length === 0) {
          const seed = [
            { id: "AH-8942X", origin: "Shanghai", destination: "London", status: "In Transit", location: "34.05N, 118.24W", weight: "450", transportMode: "Air" },
          ];
          await fetch('/api/shipments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seed)
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkInit();
    
    localStorage.setItem(VISITOR_KEY, "[]");

    const syncData = async () => {
      try {
        const shipRes = await fetch('/api/shipments');
        const shipData = await shipRes.json();
        setShipments(shipData || []);
      } catch (err) {}

      try {
        const chatRes = await fetch('/api/chat');
        const chatData = await chatRes.json();
        setChats(chatData || {});
      } catch (err) {}
      setCurrentTime(new Date().toUTCString());

      const storedVisitors = JSON.parse(localStorage.getItem(VISITOR_KEY) || "[]");
      setVisitors(storedVisitors);
      setTrafficHistory(prev => {
        const newHist = [...prev];
        newHist.push(storedVisitors.length);
        newHist.shift();
        return newHist;
      });
    };

    // Removed storage event listener for chats, relying on API polling

    syncData();
    const interval = setInterval(syncData, 5000); // 5 seconds for API
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg }, ...prev].slice(0, 50));
  };

  const filteredShipments = shipments.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManifestSubmit = async (data) => {
    const newShipments = [...shipments];
    const idx = newShipments.findIndex(x => x.id === data.id);
    if (idx >= 0) newShipments[idx] = data;
    else newShipments.unshift(data);
    
    setShipments(newShipments);
    setIsModalOpen(false);
    showToast("Ledger Updated Successfully");
    addLog(`Manifest ${data.id} processed`);
    
    try {
      await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipments)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteShipment = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Purge this manifest from the Neural Ledger?")) {
      const newShipments = shipments.filter(x => x.id !== id);
      setShipments(newShipments);
      if (selectedShipment?.id === id) setSelectedShipment(null);
      showToast("Manifest Purged");
      addLog(`Manifest ${id} purged`);
      
      try {
        await fetch('/api/shipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newShipments)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (item, e) => {
    e.stopPropagation();
    setEditItemData(item);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditItemData(null);
    setIsModalOpen(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentChatId) return;

    try {
      const chatRes = await fetch('/api/chat');
      const allChats = await chatRes.json();
      const chatData = allChats[currentChatId] || { messages: [] };
      
      chatData.messages.push({
        sender: 'admin',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      chatData.unreadByUser = true;
      chatData.unreadByAdmin = false;

      const newChats = { ...allChats, [currentChatId]: chatData };
      setChats(newChats);
      setChatInput('');
      
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChats)
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const loadChat = async (userId) => {
    setCurrentChatId(userId);
    if (chats[userId]?.unreadByAdmin) {
      try {
        const chatRes = await fetch('/api/chat');
        const allChats = await chatRes.json();
        
        if (allChats[userId]) {
          allChats[userId].unreadByAdmin = false;
          setChats(allChats);
          
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allChats)
          });
        }
      } catch (err) {
        console.error("Failed to mark chat as read", err);
      }
    }
  };

  const handleWipeChat = async () => {
    if (!currentChatId || !window.confirm("Wipe this communication channel?")) return;
    try {
      const chatRes = await fetch('/api/chat');
      const allChats = await chatRes.json();
      
      delete allChats[currentChatId];
      
      setChats(allChats);
      setCurrentChatId(null);
      
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allChats)
      });
    } catch (err) {
      console.error("Failed to wipe chat", err);
    }
  };

  const hasUnreadSupport = Object.values(chats).some(c => c.unreadByAdmin);
  const activeTransits = shipments.filter(x => x.status === 'In Transit').length;

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row antialiased bg-[#f4f7fb] text-slate-600 font-sans selection:bg-green-100 selection:text-green-900 overflow-hidden">
      
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        hasUnreadSupport={hasUnreadSupport}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40 shrink-0 shadow-sm relative">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
              <span className="material-symbols-outlined text-xl">hub</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight">Allcargo</span>
          </div>
          <div className="relative">
            <button onClick={() => setIsMobileProfileMenuOpen(!isMobileProfileMenuOpen)} className="flex items-center gap-3 relative cursor-pointer outline-none">
              <div className="size-2 bg-green-500 rounded-full animate-pulse absolute -top-0.5 -right-0.5 border border-white z-10"></div>
              <img src="https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff" alt="Admin" className="size-8 rounded-full border border-slate-200" />
            </button>

            {/* Mobile Profile Dropdown */}
            {isMobileProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMobileProfileMenuOpen(false)}></div>
                <div className="absolute top-12 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 flex flex-col py-2 animate-[fadeIn_0.2s_ease-out]">
                  <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer text-left">
                    <span className="material-symbols-outlined text-[18px]">settings</span> Settings
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer text-left">
                    <span className="material-symbols-outlined text-[18px]">group</span> Users & Roles
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer text-left">
                    <span className="material-symbols-outlined text-[18px]">history</span> Audit Logs
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 cursor-pointer text-left">
                    <span className="material-symbols-outlined text-[18px]">power_settings_new</span> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex h-24 items-center justify-between px-8 z-30 shrink-0">
          <div>
            <h2 className="text-slate-900 font-display font-bold text-2xl tracking-tight capitalize">
              {currentView === 'overview' ? 'System Overview' : 
               currentView === 'shipments' ? 'Neural Ledger' : 
               currentView === 'visitors' ? 'Live Signals' : 'Comms Uplink'}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">{currentTime}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <div className="bg-white border border-slate-100 rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-bold tracking-wide">CONNECTED</span>
                </div>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uplink</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-bold tracking-wide">SECURE</span>
                </div>
              </div>
            </div>

            <button onClick={openNewModal} className="group ml-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] cursor-pointer hover:-translate-y-0.5">
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-lg">add_circle</span> Initialize Manifest
              </span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-28 md:pb-8 relative custom-scrollbar">
          
          {/* OVERVIEW VIEW */}
          {currentView === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] max-w-7xl mx-auto">
              
              {/* TOP ROW: Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <LightStatCard icon="inventory_2" title="Total Manifests" value={shipments.length} color="green" subtext="+100% vs yesterday" />
                <LightStatCard icon="flight_takeoff" title="Active Transits" value={activeTransits} color="blue" subtext="No change" />
                <LightStatCard icon="sensors" title="Live Signals" value={visitors.length} color="green" subtext="All systems normal" />
                <LightStatCard icon="warning" title="Pending Issues" value={0} color="orange" subtext="No open issues" />
              </div>

              {/* MIDDLE ROW: Analytics & Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Analytics */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-slate-900 font-bold flex items-center gap-2 text-lg">
                      <span className="material-symbols-outlined text-green-500">monitoring</span> 
                      Live Traffic Analytics
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer">
                      <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Real-time Feed</span>
                      <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center py-10 relative z-10">
                    <div className="relative size-32 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 border border-green-100 rounded-full"></div>
                      <div className="absolute inset-2 border border-green-100 rounded-full"></div>
                      <div className="absolute inset-6 border border-green-200 rounded-full"></div>
                      <div className="absolute inset-10 border border-green-300 rounded-full flex items-center justify-center bg-green-50">
                        <div className="size-3 bg-green-500 rounded-full relative">
                           {visitors.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-1/2 w-1/2 h-[1px] bg-gradient-to-r from-green-500 to-transparent origin-left rotate-45"></div>
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">{visitors.length > 0 ? `${visitors.length} Active Signals` : 'No Traffic Detected'}</h4>
                    <p className="text-slate-500 text-sm">All monitored routes are clear.</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold mt-4 uppercase tracking-widest border-t border-slate-50 pt-4 relative z-10">
                    <span className="text-slate-400">Signal: <span className={visitors.length > 0 ? "text-green-500" : "text-green-500"}>STANDBY</span></span>
                    <span className="text-slate-400">Packets/Sec: <span className="text-green-500">SYNCED</span></span>
                  </div>
                </div>

                {/* Terminal Output */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 font-bold text-lg">Terminal Output</h3>
                    <div className="size-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 font-mono text-xs overflow-y-auto custom-scrollbar border border-slate-100 text-slate-600 leading-loose">
                    <div className="text-slate-500">&gt; Initializing command_os v2.0...</div>
                    <div className="flex justify-between"><span className="text-slate-500">&gt; Connecting to database...</span> <span className="text-green-500">[ OK ]</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">&gt; Uplink secure.</span> <span className="text-green-500">[ OK ]</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">&gt; Fetching system status...</span> <span className="text-green-500">[ OK ]</span></div>
                    
                    {logs.map((log, i) => (
                      <div key={i} className="text-slate-600">
                        <span className="text-slate-400">&gt; {log.time}:</span> {log.msg}
                      </div>
                    ))}
                    {logs.length === 0 && <div className="text-slate-500">&gt; No recent activity.</div>}
                    <div className="h-4 w-2 bg-slate-900 mt-2 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: System Health, Network, Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* System Health */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 font-bold flex items-center gap-2 text-md">
                      <span className="material-symbols-outlined text-green-500 text-xl">favorite</span> 
                      System Health
                    </h3>
                    <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-slate-500">arrow_forward</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <HealthItem icon="database" label="Database" status="Connected" color="green" />
                    <HealthItem icon="wifi" label="Uplink" status="Secure" color="green" />
                    <HealthItem icon="hard_drive" label="Storage" status="72% Used" color="slate" />
                    <HealthItem icon="api" label="API Services" status="Operational" color="green" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                    <button className="text-green-600 font-bold text-xs uppercase tracking-widest hover:text-green-700 flex items-center justify-center gap-1 w-full cursor-pointer">
                      View full diagnostics <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Network Activity */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 font-bold flex items-center gap-2 text-md">
                      <span className="material-symbols-outlined text-green-500 text-xl">show_chart</span> 
                      Network Activity
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 cursor-pointer">Last 24 Hours <span className="material-symbols-outlined text-sm">expand_more</span></span>
                  </div>
                  
                  {/* Mock Chart Area */}
                  <div className="flex-1 relative h-32 w-full mt-2 border-b border-slate-100 pb-2">
                     <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,80 Q20,60 40,70 T80,50 T120,40 T160,70 T200,60 T240,40 T280,10 T320,50 T360,70 T400,60 L400,100 L0,100 Z" fill="url(#chartGrad)" />
                        <path d="M0,80 Q20,60 40,70 T80,50 T120,40 T160,70 T200,60 T240,40 T280,10 T320,50 T360,70 T400,60" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                        
                        {/* Mock data points */}
                        <circle cx="80" cy="50" r="3" fill="white" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="160" cy="70" r="3" fill="white" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="280" cy="10" r="3" fill="white" stroke="#10b981" strokeWidth="1.5" />
                     </svg>
                     
                     <div className="absolute bottom-0 left-0 w-full flex justify-between text-[8px] text-slate-400 font-mono mt-1">
                       <span>14:00</span>
                       <span>18:00</span>
                       <span>22:00</span>
                       <span>02:00</span>
                       <span>06:00</span>
                       <span>10:00</span>
                       <span>14:00</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Inbound</p>
                      <p className="text-slate-900 font-bold text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500 text-[14px]">arrow_downward</span> 1.24 GB
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Outbound</p>
                      <p className="text-slate-900 font-bold text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500 text-[14px]">arrow_upward</span> 2.47 GB
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Traffic</p>
                      <p className="text-slate-900 font-bold text-sm">3.71 GB</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg. Latency</p>
                      <p className="text-slate-900 font-bold text-sm">28 ms</p>
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-900 font-bold flex items-center gap-2 text-md">
                      <span className="material-symbols-outlined text-green-500 text-xl">notifications_active</span> 
                      Recent Alerts
                    </h3>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest cursor-pointer flex items-center gap-1">View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
                  </div>
                  <div className="space-y-0 flex-1">
                    <AlertItem icon="check_circle" title="System scan completed" desc="No threats detected" time="14:20 GMT" color="text-green-500" />
                    <AlertItem icon="info" title="Uplink bandwidth optimized" desc="Auto-adjustment successful" time="14:05 GMT" color="text-blue-500" />
                    <AlertItem icon="check_circle" title="Database backup completed" desc="Snapshot saved successfully" time="13:50 GMT" color="text-green-500" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                    <button className="text-green-600 font-bold text-xs uppercase tracking-widest hover:text-green-700 flex items-center justify-center gap-1 w-full cursor-pointer">
                      View all alerts <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SHIPMENTS VIEW */}
          {currentView === 'shipments' && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out] max-w-7xl mx-auto w-full">
              {/* Top Row: Ledger + Map */}
              <div className="flex flex-col md:flex-row gap-6 h-auto min-h-[500px] md:h-[calc(100vh-240px)] w-full">
                {/* Left Column */}
                <div className="w-full md:w-[380px] bg-white border border-slate-100 rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.03)] h-[500px] md:h-full">
                
                {/* Search Header */}
                <div className="p-5 border-b border-slate-100 bg-white flex gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search Neural Ledger..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none placeholder-slate-400 transition-all" 
                    />
                  </div>
                  <button className="bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                  </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/30">
                  {filteredShipments.map(item => (
                    <div key={item.id} onClick={() => setSelectedShipment(item)} className={`bg-white border ${selectedShipment?.id === item.id ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200'} shadow-sm rounded-2xl cursor-pointer hover:border-green-300 transition-all p-5 relative overflow-hidden group`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-slate-900 font-display font-bold text-lg">{item.id}</h3>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigator.clipboard.writeText(item.id); 
                                alert(`Copied tracking ID: ${item.id}`); 
                              }} 
                              className="text-slate-400 hover:text-green-500 transition-colors cursor-pointer flex items-center justify-center p-1 rounded-md hover:bg-green-50"
                              title="Copy Tracking ID"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.cargo || 'General Cargo'}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${item.status === 'In Transit' ? 'bg-blue-50 text-blue-600' : item.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-green-50 text-green-600'}`}>{item.status === 'Customs Hold' ? 'CUSTOMS' : item.status}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">ETA: {item.eta ? new Date(item.eta).toLocaleDateString() : 'PENDING'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold mt-2">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <div className="size-2 bg-green-500 rounded-full"></div>
                          {item.origin}
                        </div>
                        <div className="flex-1 px-3 flex items-center gap-1 relative text-green-500">
                          <div className="h-[2px] flex-1 border-t-2 border-dashed border-green-200"></div>
                          <span className="material-symbols-outlined text-sm">{item.transportMode === 'Sea' ? 'directions_boat' : item.transportMode === 'Road' ? 'local_shipping' : item.transportMode === 'Rail' ? 'train' : 'flight'}</span>
                          <div className="h-[2px] flex-1 border-t-2 border-dashed border-green-200"></div>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {item.destination}
                          <div className="size-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-bold mt-1 px-4">
                         <span>CN</span>
                         <span>UK</span>
                      </div>

                      <div className="mt-5 flex gap-3 pt-4 border-t border-slate-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => openEditModal(item, e)} className="flex-1 flex justify-center items-center gap-1 text-[10px] font-bold tracking-widest bg-slate-50 text-green-600 hover:bg-green-50 py-2.5 rounded-xl transition-colors cursor-pointer border border-slate-100">
                          <span className="material-symbols-outlined text-sm">edit</span> EDIT
                        </button>
                        <button onClick={(e) => deleteShipment(item.id, e)} className="flex-1 flex justify-center items-center gap-1 text-[10px] font-bold tracking-widest bg-slate-50 text-red-500 hover:bg-red-50 py-2.5 rounded-xl transition-colors cursor-pointer border border-slate-100">
                          <span className="material-symbols-outlined text-sm">delete</span> DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredShipments.length === 0 && (
                    <div className="p-8 text-center text-slate-500 font-medium text-sm">No manifests found.</div>
                  )}
                </div>
                
                {/* Pagination / Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-400 font-bold">
                  <span>Showing {filteredShipments.length > 0 ? 1 : 0} of {filteredShipments.length} manifest{filteredShipments.length !== 1 ? 's' : ''}</span>
                  <div className="flex gap-1">
                     <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 cursor-pointer disabled:opacity-50" disabled><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                     <button className="size-8 rounded-lg border border-green-500 text-green-600 font-bold flex items-center justify-center bg-green-50">1</button>
                     <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 cursor-pointer disabled:opacity-50" disabled><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </div>
                </div>
              </div>

                {/* Right Column (Map Only) */}
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-2 h-[500px] md:h-full">
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
                        <span className="material-symbols-outlined text-xl">public</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Global Manifest Map</h3>
                        <p className="text-xs font-medium text-slate-500">Real-time manifest routing & status</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                       <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer">
                         <option>All Status</option>
                         <option>In Transit</option>
                       </select>
                       <button className="bg-slate-50 border border-slate-200 rounded-xl size-9 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer">
                         <span className="material-symbols-outlined text-sm">fullscreen</span>
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-[#e8f2f9] rounded-xl relative overflow-hidden mx-4 mb-4 border border-slate-100">
                    <ComposableMap projectionConfig={{ scale: 160 }} style={{ width: "100%", height: "100%" }}>
                      <ZoomableGroup 
                        zoom={position.zoom} 
                        center={position.coordinates} 
                        onMoveEnd={(pos) => { setPosition(pos); setTargetPosition(pos); }}
                      >
                        <Geographies geography={geoUrl}>
                          {({ geographies }) =>
                            geographies.map((geo) => (
                              <Geography key={geo.rsmKey} geography={geo} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#f1f5f9" }, pressed: { outline: "none" } }} />
                            ))
                          }
                        </Geographies>
                        
                        {selectedShipment && (
                          <>
                            <style>{`
                              @keyframes dashFlow {
                                to { stroke-dashoffset: -8; }
                              }
                              .animate-dash-flow {
                                animation: dashFlow 1s linear infinite;
                              }
                            `}</style>
                            <Line
                              from={mapCoords.origin}
                              to={mapCoords.dest}
                              stroke="#10b981"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              strokeLinecap="round"
                              className={selectedShipment.status === 'In Transit' ? "animate-dash-flow" : ""}
                            />
                            
                            <Marker coordinates={mapCoords.origin}>
                              <g transform="translate(-12, -24)">
                                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" fill="#10b981" stroke="#fff" strokeWidth={1.5} />
                                <circle cx="12" cy="10" r="3" fill="#fff" />
                              </g>
                              <foreignObject x="-50" y="8" width="100" height="40" style={{ overflow: 'visible' }}>
                                 <div className="bg-white px-2 py-1 rounded-md shadow-md border border-slate-100 text-[10px] font-bold text-slate-900 text-center leading-tight mx-auto max-w-[80px]">
                                   {selectedShipment.origin}<br/><span className="text-slate-400 font-normal">Origin</span>
                                 </div>
                              </foreignObject>
                            </Marker>
                            
                            <Marker coordinates={mapCoords.dest}>
                              <g transform="translate(-12, -24)">
                                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
                                <circle cx="12" cy="10" r="3" fill="#fff" />
                              </g>
                              <foreignObject x="-50" y="8" width="100" height="40" style={{ overflow: 'visible' }}>
                                 <div className="bg-white px-2 py-1 rounded-md shadow-md border border-slate-100 text-[10px] font-bold text-slate-900 text-center leading-tight mx-auto max-w-[80px]">
                                   {selectedShipment.destination}<br/><span className="text-slate-400 font-normal">Destination</span>
                                 </div>
                              </foreignObject>
                            </Marker>
                            
                            <Marker coordinates={planePos}>
                              <g transform="translate(-10, -10)">
                                 <circle cx="10" cy="10" r="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
                                 <path d="M9.5,4L9.5,10.5L14,12L14,13.5L9.5,12L9.5,15.5L10.5,16.5L10.5,17.5L8,16.5L5.5,17.5L5.5,16.5L6.5,15.5L6.5,12L2,13.5L2,12L6.5,10.5L6.5,4C6.5,3.17 7.17,2.5 8,2.5C8.83,2.5 9.5,3.17 9.5,4Z" 
                                       fill={selectedShipment.status === 'Customs Hold' ? '#f59e0b' : selectedShipment.status === 'Delivered' ? '#64748b' : '#10b981'} />
                              </g>
                            </Marker>
                          </>
                        )}
                      </ZoomableGroup>
                    </ComposableMap>
                    
                    {/* Map Controls */}
                    <div className="absolute left-4 bottom-16 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                       <button onClick={() => setTargetPosition(p => ({ ...p, zoom: Math.min(p.zoom * 2, 8) }))} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-100 cursor-pointer"><span className="material-symbols-outlined text-sm">add</span></button>
                       <button onClick={() => setTargetPosition(p => ({ ...p, zoom: Math.max(p.zoom / 2, 1) }))} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-100 cursor-pointer"><span className="material-symbols-outlined text-sm">remove</span></button>
                       <button onClick={() => setTargetPosition({ coordinates: [0, 0], zoom: 1 })} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"><span className="material-symbols-outlined text-sm">my_location</span></button>
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-4 text-[10px] font-bold text-slate-600">
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-green-500"></div> In Transit</div>
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-blue-500"></div> Origin / Destination</div>
                      <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-slate-300"></div> Pending</div>
                    </div>
                  </div>
                </div>
              </div>
                
              {/* Bottom Row Stats Unified (Spanning full width) */}
              <div className="w-full bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-1 flex flex-col lg:flex-row shrink-0">
                  
                  <div className="flex-1 flex items-center gap-4 p-4 md:border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors rounded-xl cursor-default group">
                    <div className="size-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">inventory_2</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Manifests</p>
                      <h3 className="text-xl font-display font-bold text-slate-900">{shipments.length}</h3>
                    </div>
                    <div className="ml-auto text-right">
                       <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">+100%</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-4 p-4 md:border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors rounded-xl cursor-default group">
                    <div className="size-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Transits</p>
                      <h3 className="text-xl font-display font-bold text-slate-900">{activeTransits}</h3>
                    </div>
                    <div className="ml-auto">
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Steady</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-4 p-4 md:border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors rounded-xl cursor-default group">
                    <div className="size-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">wifi</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Live Signals</p>
                      <h3 className="text-xl font-display font-bold text-slate-900">{visitors.length}</h3>
                    </div>
                    <div className="ml-auto flex items-center">
                       <span className="relative flex size-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full size-3 bg-teal-500"></span>
                       </span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors rounded-xl cursor-default group">
                    <div className="size-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">warning</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pending Issues</p>
                      <h3 className="text-xl font-display font-bold text-slate-900">0</h3>
                    </div>
                    <div className="ml-auto">
                       <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                    </div>
                  </div>

                </div>
            </div>
          )}

          {/* VISITORS VIEW */}
          {currentView === 'visitors' && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] max-w-7xl mx-auto">
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-lg">Active Signal Intercepts</h3>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Online</span>
                    <span className="text-sm text-slate-900 font-bold">{visitors.length}</span>
                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="p-5 font-bold">IP Address</th>
                        <th className="p-5 font-bold">Geo-Location</th>
                        <th className="p-5 font-bold">Current Sector</th>
                        <th className="p-5 font-bold">Time Detected</th>
                        <th className="p-5 font-bold text-right">Signal Strength</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {visitors.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-5 font-mono text-xs font-bold text-slate-900">{v.ip}</td>
                          <td className="p-5 font-medium">{v.location}</td>
                          <td className="p-5"><span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-[10px] uppercase font-bold text-slate-600">{v.page}</span></td>
                          <td className="p-5 text-slate-500 text-xs font-medium">{v.time}</td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[80%] animate-pulse"></div>
                              </div>
                              <span className="text-[10px] text-green-600 font-bold tracking-widest uppercase">Strong</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visitors.length === 0 && (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-medium">No active signals detected at this time.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUPPORT VIEW */}
          {currentView === 'support' && (
            <div className="h-full min-h-[400px] animate-[fadeIn_0.5s_ease-out] flex flex-col md:flex-row gap-6 overflow-hidden max-w-7xl mx-auto">
              <div className={`w-full md:w-[350px] bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col h-full z-10 shrink-0 ${currentChatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center rounded-t-2xl">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Incoming Transmissions</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {Object.keys(chats).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium">No transmissions detected.</div>
                  ) : (
                    Object.entries(chats).map(([userId, chat]) => {
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      return (
                        <div key={userId} onClick={() => loadChat(userId)} className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${currentChatId === userId ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}>
                          <div>
                            <h5 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                              {userId} {chat.unreadByAdmin && <span className="size-2 bg-orange-500 rounded-full animate-pulse"></span>}
                            </h5>
                            <p className="text-xs text-slate-500 truncate max-w-[160px] font-medium mt-1">{lastMsg?.text || '...'}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{lastMsg?.time || ''}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className={`flex-1 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex-col relative overflow-hidden h-full ${!currentChatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-20 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-6 rounded-t-2xl">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentChatId(null)} className="md:hidden size-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white rounded-full border border-slate-200">
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <div className="size-10 rounded-full bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs shadow-md">GST</div>
                    <div>
                      <h4 className="text-slate-900 font-bold text-base">{currentChatId || 'Select a Frequency'}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${currentChatId ? 'text-green-500' : 'text-slate-400'}`}>{currentChatId ? 'CONNECTION STABLE' : 'WAITING...'}</p>
                    </div>
                  </div>
                  {currentChatId && (
                    <button onClick={handleWipeChat} title="Wipe Channel" className="size-10 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer border border-red-100 hover:border-red-500">
                      <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] custom-scrollbar flex flex-col justify-end">
                  {!currentChatId ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-80">
                      <div className="size-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200">
                        <span className="material-symbols-outlined text-4xl text-slate-300">satellite_alt</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">No Active Transmission</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {chats[currentChatId]?.messages.map((m, idx) => {
                        const isAdmin = m.sender === 'admin';
                        return (
                          <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-[fadeInUp_0.3s_ease-out]`}>
                            <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm shadow-sm ${isAdmin ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}`}>
                              {m.type === 'image' ? (
                                <img src={m.text} alt="Transmission" className="rounded-lg max-w-full max-h-64 object-cover border border-slate-200 mt-1" />
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed font-medium">{m.text}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{isAdmin ? 'Mission Control' : 'Signal'}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{m.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type your response..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm text-slate-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all disabled:opacity-50 shadow-sm" 
                      disabled={!currentChatId} 
                    />
                    <button type="submit" disabled={!currentChatId} className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md">
                      SEND
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Bottom Navbar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50 flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
          <button onClick={() => setCurrentView('overview')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all cursor-pointer ${currentView === 'overview' ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-[24px] ${currentView === 'overview' ? 'filled' : ''}`}>grid_view</span>
            <span className="text-[9px] font-bold tracking-wide">System</span>
          </button>
          
          <button onClick={() => setCurrentView('shipments')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all cursor-pointer ${currentView === 'shipments' ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-[24px] ${currentView === 'shipments' ? 'filled' : ''}`}>radar</span>
            <span className="text-[9px] font-bold tracking-wide">Ledger</span>
          </button>

          {/* Center 3D Action Button */}
          <div className="relative -top-6">
             <button onClick={openNewModal} className="size-14 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)] border-4 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
             </button>
          </div>

          <button onClick={() => setCurrentView('visitors')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all relative cursor-pointer ${currentView === 'visitors' ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-[24px] ${currentView === 'visitors' ? 'filled' : ''}`}>public</span>
            <span className="text-[9px] font-bold tracking-wide">Signals</span>
            {currentView !== 'visitors' && <span className="absolute top-0 right-3 size-2 bg-green-500 rounded-full animate-pulse border border-white"></span>}
          </button>

          <button onClick={() => setCurrentView('support')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all relative cursor-pointer ${currentView === 'support' ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-[24px] ${currentView === 'support' ? 'filled' : ''}`}>forum</span>
            <span className="text-[9px] font-bold tracking-wide">Comms</span>
            {hasUnreadSupport && <span className="absolute top-0 right-2 size-2.5 bg-orange-500 rounded-full border border-white"></span>}
          </button>
        </div>

      </main>

      <ManifestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleManifestSubmit} 
        editItem={editItemData} 
      />

      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-[200] animate-[fadeInUp_0.3s_ease-out]">
          <div className="bg-slate-900 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            <span className="font-bold text-sm text-white">{toastMsg}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; border: 2px solid transparent; background-clip: padding-box; }
      `}</style>
    </div>
  );
}

function LightStatCard({ icon, title, value, color, subtext }) {
  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-500', line: '#10b981' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', line: '#3b82f6' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-500', line: '#f97316' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-500', line: '#94a3b8' },
  };
  const theme = colorMap[color];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`size-12 rounded-2xl flex items-center justify-center ${theme.bg} ${theme.text}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400">{subtext}</span>
        <svg width="40" height="15" viewBox="0 0 40 15">
          <path d="M0,10 Q5,15 10,8 T20,12 T30,5 T40,2" fill="none" stroke={theme.line} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function HealthItem({ icon, label, status, color }) {
  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' }
  };
  const theme = colorMap[color] || colorMap.green;
  
  return (
    <div className="flex justify-between items-center py-2.5">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-400 text-[20px]">{icon}</span>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${theme.bg} ${theme.text}`}>
        {status}
      </span>
    </div>
  );
}

function AlertItem({ icon, title, desc, time, color }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-50 last:border-0">
      <span className={`material-symbols-outlined ${color} text-xl mt-0.5`}>{icon}</span>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{desc}</p>
      </div>
      <span className="text-[10px] font-bold text-slate-400">{time}</span>
    </div>
  );
}
