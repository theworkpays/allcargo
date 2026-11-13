import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LiveMap from '../components/LiveMap';
import SupportChatWidget from '../components/SupportChatWidget';

const cityCoordinates = {
  "London, UK": [-0.1276, 51.5074],
  "Shanghai, CN": [121.4737, 31.2304],
  "New York, USA": [-74.0060, 40.7128],
  "Tokyo, Japan": [139.6917, 35.6895],
  "Los Angeles, USA": [-118.2437, 34.0522],
  "Dubai, UAE": [55.2708, 25.2048],
  "Paris, France": [2.3522, 48.8566],
  "Berlin, Germany": [13.4050, 52.5200],
  "Sydney, Australia": [151.2093, -33.8688],
  "Singapore": [103.8198, 1.3521],
  "Hong Kong": [114.1694, 22.3193],
  "Frankfurt, Germany": [8.6821, 50.1109],
  "Chicago, USA": [-87.6298, 41.8781],
  "Miami, USA": [-80.1918, 25.7617],
  "Amsterdam, Netherlands": [4.9041, 52.3676],
  "Mumbai, India": [72.8777, 19.0760],
  "Seoul, South Korea": [126.9780, 37.5665],
  "Toronto, Canada": [-79.3832, 43.6532],
  "Sao Paulo, Brazil": [-46.6333, -23.5505],
  "Johannesburg, South Africa": [28.0473, -26.2041],
  "Lagos, Nigeria": [3.3792, 6.5244],
  "Cairo, Egypt": [31.2357, 30.0444],
  "Beijing, CN": [116.4074, 39.9042],
  "Istanbul, Turkey": [28.9784, 41.0082],
  "Bangkok, Thailand": [100.5018, 13.7563],
  "Kuala Lumpur, Malaysia": [101.6869, 3.1390]
};

const mockShipmentData = {
  'AH-9021': {
    id: 'AH-9021', status: 'In Transit', 
    origin: { city: 'Lagos, Nigeria', date: 'May 24, 2026 • 08:30 GMT' },
    destination: { city: 'Rotterdam, Netherlands', date: 'May 28, 2026 • 14:30 GMT' },
    eta: { date: 'May 28, 2026', time: '14:30 GMT' },
    transportMode: { type: 'Sea Freight', carrier: 'Maersk Line' },
    currentLocation: { place: 'Atlantic Ocean', updated: 'Updated 10 min ago' },
    coordinates: { origin: [3.3792, 6.5244], destination: [4.4791, 51.9225], current: [-20.0, 30.0] },
    lastUpdated: 'Today, 11:14 PM (GMT+1)',
    history: [
      { status: 'Shipment Picked Up', date: 'May 24, 2026 • 08:30 GMT', location: 'Lagos, Nigeria', state: 'completed' },
      { status: 'Departed Origin Port', date: 'May 24, 2026 • 16:45 GMT', location: 'Lagos Port', state: 'completed' },
      { status: 'In Transit', date: 'May 26, 2026 • 10:20 GMT', location: 'Atlantic Ocean', state: 'current' },
      { status: 'Arriving at Destination Port', date: 'May 28, 2026 • 08:00 GMT', location: 'Rotterdam, Netherlands', state: 'upcoming' },
      { status: 'Out for Delivery', date: 'May 28, 2026 • 14:30 GMT', location: 'Rotterdam, Netherlands', state: 'upcoming' },
    ]
  },
  'AH-4432': {
    id: 'AH-4432', status: 'In Transit', 
    origin: { city: 'Tokyo, Japan', date: 'May 24, 2026 • 09:30 GMT' },
    destination: { city: 'Los Angeles, USA', date: 'Jun 02, 2026 • 11:00 GMT' },
    eta: { date: 'Jun 02, 2026', time: '11:00 GMT' },
    transportMode: { type: 'Ocean Freight', carrier: 'Evergreen' },
    currentLocation: { place: 'Pacific Ocean', updated: 'Updated 5 min ago' },
    coordinates: { origin: [139.6917, 35.6895], destination: [-118.2437, 34.0522], current: [-150.0, 35.0] },
    lastUpdated: 'Today, 10:20 AM (GMT+9)',
    history: [
      { status: 'Shipment Picked Up', date: 'May 24, 2026 • 09:30 GMT', location: 'Tokyo, Japan', state: 'completed' },
      { status: 'Departed Origin Port', date: 'May 25, 2026 • 18:00 GMT', location: 'Tokyo Port', state: 'completed' },
      { status: 'In Transit', date: 'May 26, 2026 • 10:20 GMT', location: 'Pacific Ocean', state: 'current' },
      { status: 'Arriving at Destination Port', date: 'Jun 01, 2026 • 08:00 GMT', location: 'Los Angeles, USA', state: 'upcoming' },
      { status: 'Out for Delivery', date: 'Jun 02, 2026 • 11:00 GMT', location: 'Los Angeles, USA', state: 'upcoming' },
    ]
  }
};


const getTransportIcon = (type) => {
  if (!type) return 'flight';
  const t = type.toLowerCase();
  if (t.includes('sea') || t.includes('ocean') || t.includes('boat') || t.includes('ship') || t.includes('vessel')) {
    return 'directions_boat';
  }
  if (t.includes('road') || t.includes('truck') || t.includes('ground') || t.includes('land')) {
    return 'local_shipping';
  }
  if (t.includes('rail') || t.includes('train')) {
    return 'train';
  }
  return 'flight';
};

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id')?.toUpperCase() || '';
  
  const [searchInput, setSearchInput] = useState(id);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toastText, setToastText] = useState(null);

  const triggerToast = (msg) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleCopyTrackingId = (trackingId) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(true);
    triggerToast('Tracking ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Tracking link copied to clipboard');
  };

  const handleSubscribeAlerts = (trackingId) => {
    triggerToast(`Subscribed to live notifications for ${trackingId}`);
  };

  useEffect(() => {
    if (id) {
      setSearchInput(id);
      handleSearch(id);
    }
  }, [id]);

  const downloadPDF = async () => {
    window.print();
  };

  const handleSearch = (searchId) => {
    setLoading(true);
    setError(false);
    
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/shipments?id=${searchId}`);
        const foundLocal = res.ok ? await res.json() : null;
        const foundMock = mockShipmentData[searchId];

        if (foundMock) {
          setShipment(foundMock);
        } else if (foundLocal) {
        // Compute coordinates
        const geocodeLocation = async (locationStr) => {
          if (!locationStr) return null;
          const key = Object.keys(cityCoordinates).find(k => locationStr.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(locationStr.toLowerCase()));
          if (key) return cityCoordinates[key];
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
          } catch (err) { console.warn("Geocode error"); }
          return null;
        };
        
        let cOrigin = await geocodeLocation(foundLocal.origin) || [-10, 40];
        let cDest = await geocodeLocation(foundLocal.destination) || [10, 40];
        let cCurrent = [-5, 45]; // Default middle point
        
        if (foundLocal.status === 'Delivered') {
          cCurrent = cDest;
        } else if (foundLocal.status === 'In Transit' || foundLocal.status === 'Customs Hold') {
          cCurrent = [(cOrigin[0] + cDest[0])/2, (cOrigin[1] + cDest[1])/2 + 10];
        } else {
          cCurrent = cOrigin;
        }

        let historyToUse = [];
        
        if (foundLocal.customHistory && foundLocal.customHistory.length > 0) {
           historyToUse = foundLocal.customHistory.map(ev => ({
             status: ev.status,
             date: ev.time ? `${ev.date} ${ev.time}` : ev.date,
             location: ev.location,
             description: ev.description,
             state: ev.state
           }));
        } else {
           const generatedHistory = [];
           const initDate = new Date();
           initDate.setDate(initDate.getDate() - 2); 

           generatedHistory.push({ status: 'Shipment Initialized', date: initDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: 'Allcargo System', state: 'completed' });
           
           if (foundLocal.status === 'Processing') {
              generatedHistory.push({ status: 'Processing at Origin', date: new Date().toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.origin || 'Origin Hub', state: 'current' });
              generatedHistory.push({ status: 'In Transit', date: 'Pending', location: 'Global Network', state: 'upcoming' });
              generatedHistory.push({ status: 'Delivered', date: 'Pending', location: foundLocal.destination || 'Destination Hub', state: 'upcoming' });
           } 
           else if (foundLocal.status === 'In Transit') {
              const pDate = new Date(initDate); pDate.setHours(pDate.getHours() + 10);
              generatedHistory.push({ status: 'Departed Origin', date: pDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.origin || 'Origin Hub', state: 'completed' });
              generatedHistory.push({ status: 'In Transit', date: new Date().toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.location || 'Live Network', state: 'current' });
              generatedHistory.push({ status: 'Arriving at Destination', date: 'Pending', location: foundLocal.destination || 'Destination Hub', state: 'upcoming' });
           }
           else if (foundLocal.status === 'Customs Hold') {
              const pDate = new Date(initDate); pDate.setHours(pDate.getHours() + 10);
              generatedHistory.push({ status: 'Departed Origin', date: pDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.origin || 'Origin Hub', state: 'completed' });
              generatedHistory.push({ status: 'Customs Inspection', date: new Date().toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.location || 'Border Agency', state: 'current' });
              generatedHistory.push({ status: 'Pending Clearance', date: 'Pending', location: 'Customs Facility', state: 'upcoming' });
           }
           else if (foundLocal.status === 'Delivered') {
              const pDate = new Date(initDate); pDate.setHours(pDate.getHours() + 10);
              const tDate = new Date(initDate); tDate.setHours(tDate.getHours() + 34);
              generatedHistory.push({ status: 'Departed Origin', date: pDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.origin || 'Origin Hub', state: 'completed' });
              generatedHistory.push({ status: 'Arrived at Destination', date: tDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.destination || 'Destination Hub', state: 'completed' });
              generatedHistory.push({ status: 'Delivered to Consignee', date: new Date().toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.location || foundLocal.destination, state: 'current' });
           } else {
              generatedHistory.push({ status: foundLocal.status || 'Processing', date: new Date().toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}), location: foundLocal.location || 'System', state: 'current' });
           }
           historyToUse = generatedHistory;
        }

        setShipment({
          id: foundLocal.id,
          status: foundLocal.status || 'Processing',
          origin: { city: foundLocal.origin || 'Unknown', date: 'Pending' },
          destination: { city: foundLocal.destination || 'Unknown', date: foundLocal.eta ? new Date(foundLocal.eta).toLocaleDateString() : 'Pending' },
          eta: { date: foundLocal.eta ? new Date(foundLocal.eta).toLocaleDateString() : 'Pending', time: '' },
          transportMode: { type: (foundLocal.transportMode || 'Air') + ' Freight', carrier: 'Allcargo' },
          currentLocation: { place: foundLocal.location || 'System', updated: 'Just now' },
          coordinates: { origin: cOrigin, destination: cDest, current: cCurrent },
          lastUpdated: 'Just now',
          history: historyToUse,
          senderName: foundLocal.senderName,
          receiverName: foundLocal.receiverName,
          receiverAddress: foundLocal.receiverAddress,
          weight: foundLocal.weight,
          serviceType: foundLocal.serviceType,
          packageName: foundLocal.packageName,
          packageImage: foundLocal.packageImage
        });
        } else {
          setShipment(null);
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setShipment(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/tracking?id=${searchInput.trim()}`);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-20 pb-20 relative font-body selection:bg-primary/20">
      <div className="print:hidden">
        {/* If there's a Navbar here, hide it. Wait, actually I don't see Navbar. Oh, tracking doesn't even render Navbar inside Tracking.jsx, it's probably in App.jsx */}
      </div>
      {/* Background Graphic elements for Hero */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('/tracking-bg.png')] bg-top bg-no-repeat bg-cover sm:bg-contain opacity-90"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 pt-8 sm:pt-12">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12 print:hidden">
           <div className="lg:w-1/2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                REAL-TIME SHIPMENT TRACKING
             </div>
             <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
               Track Your <span className="text-primary">Shipment</span>
             </h1>
             <p className="text-slate-500 mt-3 max-w-md">
               Enter your tracking number to get real-time updates on your shipment status and location.
             </p>
           </div>
           
           <div className="lg:w-[45%] max-w-xl">
             <form onSubmit={onSubmit} className="bg-white p-2 sm:p-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center relative transition-all focus-within:shadow-[0_12px_40px_rgba(15,147,83,0.12)] focus-within:border-primary/30">
               <span className="material-symbols-outlined text-slate-400 ml-3 mr-2">search</span>
               <input
                 type="text"
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 placeholder="Enter Tracking ID (e.g. AH-9021)"
                 className="bg-transparent border-none focus:ring-0 text-slate-800 font-medium w-full placeholder:text-slate-400 focus:outline-none"
               />
               <button type="submit" className="bg-primary hover:bg-primary-light text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shrink-0 cursor-pointer">
                 Track Now
               </button>
             </form>
             <div className="flex items-center gap-2 mt-4 ml-2 text-slate-500 text-xs font-medium">
               <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
               Your data is secure and encrypted
             </div>
             {error && <p className="text-red-500 text-sm font-semibold mt-2 ml-2">Shipment not found. Please verify the ID.</p>}
           </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="relative flex h-12 w-12 mb-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-primary/20 items-center justify-center">
                  <span className="material-symbols-outlined text-primary animate-spin">refresh</span>
                </span>
             </div>
             <p className="text-slate-500 font-medium animate-pulse">Locating shipment data...</p>
          </div>
        )}

        {/* Shipment Data */}
        {!loading && shipment && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 bg-slate-50/50 -m-4 p-4 rounded-3xl"
            id="pdf-content"
          >
            {/* Top Card: Header & Grid */}
            <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              
              {/* Header */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="size-12 sm:size-14 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                     <span className="material-symbols-outlined text-2xl sm:text-3xl">{getTransportIcon(shipment.transportMode?.type)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display whitespace-nowrap">
                         Shipment {shipment.id}
                       </h2>
                       <button 
                         onClick={() => handleCopyTrackingId(shipment.id)} 
                         className="size-7 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200/70 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                         title="Copy Tracking ID"
                       >
                          <span className="material-symbols-outlined text-[16px]">{copiedId ? 'check' : 'content_copy'}</span>
                       </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold text-[11px]">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {shipment.status}
                       </span>
                       <span className="text-slate-400 font-medium text-[11px] sm:text-xs">
                         • Last updated: {shipment.lastUpdated || 'Just now'}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Mobile-optimized action buttons in 1 single clean row */}
                <div id="download-btn-container" className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full lg:w-auto print:hidden">
                   <button 
                     onClick={handleShare} 
                     className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
                   >
                     <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-slate-500">share</span> 
                     <span>Share</span>
                   </button>
                   
                   <button 
                     onClick={downloadPDF} 
                     className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
                   >
                     <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-slate-500">download</span> 
                     <span>Download</span>
                   </button>
                   
                   <button 
                     onClick={() => handleSubscribeAlerts(shipment.id)} 
                     className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                   >
                     <span className="material-symbols-outlined text-[16px] sm:text-[18px]">notifications_active</span> 
                     <span>Alerts</span>
                   </button>
                </div>
              </div>

              {/* Route Corridor: Simple, Clean & Never Truncated */}
              <div className="bg-slate-50/60 border-b border-slate-100 px-5 py-4 sm:px-8 sm:py-5">
                <div className="flex items-center justify-between gap-3 sm:gap-6">
                  {/* Origin */}
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Origin</span>
                    <p className="text-base sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">{shipment.origin.city}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{shipment.origin.date || 'Departed'}</p>
                  </div>

                  {/* Clean Transit Line with Plane */}
                  <div className="flex-1 flex flex-col items-center px-2 sm:px-6 max-w-[220px]">
                    <div className="w-full flex items-center relative py-2">
                      <div className="h-[2px] w-full bg-slate-200 relative rounded-full">
                        <div className="h-full bg-emerald-500 w-2/3 rounded-full"></div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white border border-emerald-300 shadow-sm flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[16px] rotate-45">
                          {getTransportIcon(shipment.transportMode?.type)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Transit
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="text-right min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Destination</span>
                    <p className="text-base sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">{shipment.destination.city}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{shipment.destination.date || 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Specs: Clean, Simple & Modern Key-Value Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 px-5 py-3 sm:px-8 sm:py-5 bg-white">
                {/* 1. Est. Delivery */}
                <div className="py-2.5 sm:py-0 sm:px-4 sm:first:pl-0 flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-slate-400">calendar_today</span>
                    Est. Delivery
                  </span>
                  <span className="text-sm font-bold text-slate-900">{shipment.eta.date || 'Pending'}</span>
                </div>

                {/* 2. Transport Mode */}
                <div className="py-2.5 sm:py-0 sm:px-4 flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-slate-400">{getTransportIcon(shipment.transportMode?.type)}</span>
                    Transport Mode
                  </span>
                  <span className="text-sm font-bold text-slate-900">{shipment.transportMode.type}</span>
                </div>

                {/* 3. Live Position */}
                <div className="py-2.5 sm:py-0 sm:px-4 sm:last:pr-0 flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-slate-400">near_me</span>
                    Current Location
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {shipment.currentLocation.place}
                  </span>
                </div>
              </div>
            </div>

            {/* NEW: Shipment Details & Media Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Package Media Card */}
              {shipment.packageImage && (
                <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Package Media</h3>
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group cursor-pointer" onClick={() => window.open(shipment.packageImage, '_blank')}>
                    <img src={shipment.packageImage} alt="Package" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">zoom_in</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Detailed Specs Card */}
              <div className={`bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 flex flex-col justify-between ${shipment.packageImage ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Manifest Details</h3>
                      <p className="text-xs text-slate-400 font-medium">Bill of lading & consignee declaration</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                    {shipment.id}
                  </span>
                </div>

                {/* Parties: Sender & Receiver */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-100">
                  {/* Sender */}
                  <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-start gap-3.5">
                    <div className="size-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Sender / Consignor</span>
                      <p className="text-sm font-bold text-slate-900 truncate">{shipment.senderName || 'Authorized Consignor'}</p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{shipment.origin.city}</p>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-start gap-3.5">
                    <div className="size-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[18px]">flight_land</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Receiver / Consignee</span>
                      <p className="text-sm font-bold text-slate-900 truncate">{shipment.receiverName || 'Authorized Consignee'}</p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{shipment.receiverAddress || shipment.destination.city}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo Specifications 4-Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                  {/* Service Level */}
                  <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Service Level</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">{getTransportIcon(shipment.transportMode?.type)}</span>
                      {shipment.serviceType || 'Priority Express'}
                    </p>
                  </div>

                  {/* Contents */}
                  <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contents</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{shipment.packageName || 'Standard Cargo'}</p>
                  </div>

                  {/* Gross Weight */}
                  <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gross Weight</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate font-mono">
                      {shipment.weight ? (String(shipment.weight).toLowerCase().includes('kg') || String(shipment.weight).toLowerCase().includes('lbs') ? shipment.weight : `${shipment.weight} kg`) : 'Pending'}
                    </p>
                  </div>

                  {/* Customs / Declaration */}
                  <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Declaration</span>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500"></span>
                      Cleared
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Map & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Left: Map Card */}
               <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col relative h-[450px] overflow-hidden">
                 <div className="flex items-center justify-between mb-4 z-20">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 bg-green-50 rounded-xl flex items-center justify-center text-green-500 border border-green-100">
                        <span className="material-symbols-outlined text-lg">public</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">Live Shipment Map</h3>
                        <p className="text-[11px] font-medium text-slate-400">Real-time transit routing & status</p>
                      </div>
                    </div>
                    {/* Origin to Destination Route Pill Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                      <span className="text-green-600">{shipment.origin?.city || shipment.origin}</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">flight_takeoff</span>
                      <span className="text-blue-600">{shipment.destination?.city || shipment.destination}</span>
                    </div>
                  </div>
                 
                 <div className="flex-grow w-full h-full relative">
                   <LiveMap 
                      origin={shipment.coordinates.origin} 
                      destination={shipment.coordinates.destination} 
                      originName={shipment.origin?.city || shipment.origin}
                      destinationName={shipment.destination?.city || shipment.destination}
                      current={shipment.coordinates.current} 
                      carrier={shipment.transportMode.carrier} 
                      type={shipment.transportMode.type} 
                      status={shipment.status}
                    />
                 </div>
               </div>

               {/* Right: Timeline Card */}
               <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col h-[450px]">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900">Shipment Progress</h3>
                    <Link to="#" className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-light transition-colors">
                      View Full Timeline <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                 </div>
                 
                 <div className="relative flex-grow overflow-y-auto pr-2 custom-scrollbar pl-2">
                   {/* Continuous Vertical Line */}
                   <div className="absolute left-[13px] top-4 bottom-8 w-[2px] bg-slate-100 z-0"></div>

                   <div className="space-y-6">
                     {shipment.history.map((item, idx) => (
                       <div key={idx} className="relative z-10 flex gap-4">
                         
                         {/* Status Icon */}
                         <div className="shrink-0 mt-0.5 relative">
                           {item.state === 'completed' && (
                             <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white">
                               <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                             </div>
                           )}
                           {item.state === 'current' && (
                             <div className="w-7 h-7 rounded-full border-2 border-primary bg-white flex items-center justify-center ring-4 ring-white">
                               <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>
                             </div>
                           )}
                           {item.state === 'upcoming' && (
                             <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center ring-4 ring-white">
                             </div>
                           )}
                         </div>

                         {/* Details */}
                         <div className="flex-grow pb-2">
                           <div className="flex items-start justify-between gap-4">
                             <div>
                               <p className={`text-sm font-bold ${item.state === 'upcoming' ? 'text-slate-600' : 'text-slate-900'}`}>{item.status}</p>
                               <p className="text-xs text-slate-500 font-medium mt-1">{item.date}</p>
                             </div>
                             <div className="text-right shrink-0">
                               {item.state === 'current' && (
                                 <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded mb-1">
                                   Current Location
                                 </span>
                               )}
                               <p className={`text-xs ${item.state === 'current' ? 'text-primary font-bold' : 'text-slate-500 font-medium'}`}>
                                 {item.location}
                               </p>
                             </div>
                           </div>
                           {item.description && (
                             <p className="text-xs text-slate-500 mt-2 font-medium">{item.description}</p>
                           )}
                         </div>

                       </div>
                     ))}
                   </div>
                 </div>
               </div>

            </div>
          </motion.div>
        )}

        {/* Extra Sections (Always visible, pushed down by shipment results) */}
        <div className="mt-24 flex flex-col gap-24 pb-10">
           
           {/* Section 1: Features */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
           >
             <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Track with Allcargo?</h2>
               <p className="text-slate-500 mt-3 max-w-xl mx-auto">Experience next-generation logistics tracking with real-time updates and bank-grade security.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { icon: 'speed', title: 'Real-Time Updates', desc: 'Get live location data straight from the vessel or carrier.' },
                 { icon: 'verified_user', title: 'Secure & Encrypted', desc: 'Your tracking and shipment data is protected with AES-256 encryption.' },
                 { icon: 'public', title: 'Global Coverage', desc: 'Track shipments seamlessly across 200+ countries and territories.' },
                 { icon: 'support_agent', title: '24/7 Support', desc: 'Our logistics experts are always available to help you.' }
               ].map((feature, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(15,147,83,0.08)] hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                     <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                   <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
             </div>
           </motion.div>

           {/* Section 2: FAQ */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="max-w-3xl mx-auto w-full"
           >
             <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
             </div>
             <div className="space-y-4">
               {[
                 { q: 'How often is the tracking information updated?', a: 'Our tracking information is updated in real-time as your shipment reaches various milestones or as the vessel reports its GPS location.' },
                 { q: 'What does "In Transit" mean?', a: '"In Transit" means your shipment is currently on its way to the destination. It is actively moving through our logistics network.' },
                 { q: 'Can I track multiple shipments at once?', a: 'Yes! If you have an Allcargo account, you can view all your active shipments on your personalized dashboard.' },
                 { q: 'What should I do if my shipment is delayed?', a: 'Delays can happen due to weather or customs. You can subscribe to alerts to stay informed, or contact our 24/7 support team for detailed assistance.' }
               ].map((faq, i) => (
                 <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow">
                   <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                     <span className="material-symbols-outlined text-primary text-[22px] mt-0.5 shrink-0">help</span>
                     {faq.q}
                   </h4>
                   <p className="text-slate-500 text-sm sm:text-base ml-[34px] leading-relaxed">{faq.a}</p>
                 </div>
               ))}
             </div>
           </motion.div>

        </div>
      </div>
      <SupportChatWidget />
    </div>
  );
}
