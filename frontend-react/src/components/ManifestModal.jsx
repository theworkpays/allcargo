import React, { useState, useEffect } from 'react';

const LOGISTICS_HUBS = [
  "London, UK", "Shanghai, CN", "New York, USA", "Tokyo, Japan",
  "Los Angeles, USA", "Dubai, UAE", "Paris, France", "Berlin, Germany",
  "Sydney, Australia", "Singapore", "Hong Kong", "Frankfurt, Germany",
  "Chicago, USA", "Miami, USA", "Amsterdam, Netherlands", "Mumbai, India",
  "Seoul, South Korea", "Toronto, Canada", "Sao Paulo, Brazil",
  "Johannesburg, South Africa", "Lagos, Nigeria", "Cairo, Egypt",
  "Beijing, CN", "Istanbul, Turkey", "Bangkok, Thailand", "Kuala Lumpur, Malaysia"
];

const AutocompleteInput = ({ label, name, value, onChange, placeholder, required, icon = "location_on" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredHubs = LOGISTICS_HUBS.filter(hub => 
    hub.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
          {icon}
        </span>
        <input 
          type="text" 
          name={name} 
          value={value} 
          onChange={(e) => { onChange(e); setIsOpen(true); }} 
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all shadow-2xs" 
          placeholder={placeholder} 
          required={required} 
          autoComplete="off"
        />
      </div>
      {isOpen && value && filteredHubs.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {filteredHubs.map(hub => (
             <div 
               key={hub} 
               onClick={() => {
                 onChange({ target: { name, value: hub } });
                 setIsOpen(false);
               }}
               className="px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer transition-colors border-b border-slate-50 last:border-0 font-medium flex items-center gap-2"
             >
               <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">pin_drop</span>
               <span className="truncate">{hub}</span>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ManifestModal({ isOpen, onClose, onSubmit, editItem }) {
  const [formData, setFormData] = useState({
    id: '',
    serviceType: 'Allcargo International Priority',
    weight: '',
    senderName: '',
    origin: '', 
    receiverName: '',
    receiverEmail: '',
    receiverAddress: '',
    destination: '', 
    packageName: '',
    shipDate: '',
    eta: '',
    status: 'In Transit', 
    transportMode: 'Air',
    customHistory: [],
    packageImage: null,
    packageMediaType: 'image', // 'image' | 'video'
    packageMediaName: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        const isVideo = editItem.packageMediaType === 'video' || (typeof editItem.packageImage === 'string' && (editItem.packageImage.startsWith('data:video') || editItem.packageImage.match(/\.(mp4|webm|mov|m4v|ogg)($|\?)/i)));
        setFormData({
          id: editItem.id || '',
          serviceType: editItem.serviceType || 'Allcargo International Priority',
          weight: editItem.weight || '',
          senderName: editItem.senderName || '',
          origin: editItem.origin || '',
          receiverName: editItem.receiverName || '',
          receiverEmail: editItem.receiverEmail || '',
          receiverAddress: editItem.receiverAddress || '',
          destination: editItem.destination || '',
          packageName: editItem.packageName || '',
          shipDate: editItem.shipDate || '',
          eta: editItem.eta || '',
          status: editItem.status || 'In Transit',
          transportMode: editItem.transportMode || 'Air',
          customHistory: editItem.customHistory || [],
          packageImage: editItem.packageImage || null,
          packageMediaType: isVideo ? 'video' : 'image',
          packageMediaName: editItem.packageMediaName || ''
        });
      } else {
        generateId();
      }
    }
  }, [isOpen, editItem]);

  const generateId = () => {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomPart = '';
    // 9 digits
    for (let i = 0; i < 9; i++) {
      randomPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    // 1 letter at the end
    randomPart += letters.charAt(Math.floor(Math.random() * letters.length));
    setFormData(prev => ({ ...prev, id: 'AH' + randomPart }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTimelineEvent = () => {
    setFormData(prev => ({
      ...prev,
      customHistory: [
        ...prev.customHistory, 
        { date: '', time: '', status: 'In Transit', location: '', description: '', state: 'upcoming' }
      ]
    }));
  };

  const updateTimelineEvent = (index, field, value) => {
    const newHistory = [...formData.customHistory];
    newHistory[index][field] = value;
    setFormData(prev => ({ ...prev, customHistory: newHistory }));
  };

  const setTimelineCurrentStep = (index) => {
    const newHistory = formData.customHistory.map((ev, i) => ({
      ...ev,
      state: i < index ? 'completed' : i === index ? 'current' : 'upcoming'
    }));
    setFormData(prev => ({ ...prev, customHistory: newHistory }));
  };

  const removeTimelineEvent = (index) => {
    const newHistory = formData.customHistory.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, customHistory: newHistory }));
  };

  // Dual Photo & Video Media Handler (Supports up to 25MB)
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSize) {
      alert('Media file is too large. Please select a photo or video under 25MB.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        packageImage: reader.result,
        packageMediaType: isVideo ? 'video' : 'image',
        packageMediaName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setFormData(prev => ({
      ...prev,
      packageImage: null,
      packageMediaType: 'image',
      packageMediaName: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-[28px] w-full max-w-4xl shadow-2xl relative my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-11 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">local_shipping</span>
            </div>
            <div>
              <h2 className="text-slate-900 font-bold text-lg sm:text-xl tracking-tight leading-tight">
                {editItem ? 'Edit Shipment Manifest' : 'New Shipment Manifest'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                Configure live tracking credentials, consignee data, cargo media, and milestone telemetry.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-white rounded-full p-2 border border-slate-200 hover:bg-slate-100 shadow-2xs active:scale-90"
          >
            <span className="material-symbols-outlined text-[19px] block">close</span>
          </button>
        </div>
        
        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white flex-1">
          <form id="manifest-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            
            {/* Card 1: Primary Identity & Service Level */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-200/60">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">badge</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shipment Identity & Specs</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {/* Tracking Number */}
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tracking Number *
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="id" 
                      value={formData.id} 
                      onChange={handleChange}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none shadow-2xs min-w-0" 
                      required 
                      readOnly={!!editItem} 
                    />
                    {!editItem && (
                      <button 
                        type="button" 
                        onClick={generateId} 
                        className="px-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">autorenew</span>
                        <span>Regen</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Service Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Service Level
                  </label>
                  <select 
                    name="serviceType" 
                    value={formData.serviceType} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="Allcargo International Priority">International Priority (Air)</option>
                    <option value="Allcargo Standard">Standard Cargo Freight</option>
                    <option value="Allcargo Express">Express Air Courier</option>
                  </select>
                </div>

                {/* Gross Weight */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Gross Weight
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                      scale
                    </span>
                    <input 
                      type="text" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleChange} 
                      placeholder="e.g. 2.5 lb / 450 kg" 
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none shadow-2xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Consignor (Sender) & Consignee (Receiver) */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-200/60">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">group</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parties & Routing Corridor</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                
                {/* SENDER PANEL */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500"></span>
                      Consignor (Sender)
                    </span>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">flight_takeoff</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sender Name / Company</label>
                    <input 
                      type="text" 
                      name="senderName" 
                      value={formData.senderName} 
                      onChange={handleChange} 
                      placeholder="e.g. Shenzhen Logistics Hub" 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none shadow-2xs" 
                    />
                  </div>
                  <div>
                    <AutocompleteInput 
                      label="Origin City & Country (Pinned Map Hub)" 
                      name="origin" 
                      value={formData.origin} 
                      onChange={handleChange} 
                      placeholder="e.g. Shanghai, CN" 
                      required 
                      icon="flight_takeoff"
                    />
                  </div>
                </div>

                {/* RECEIVER PANEL */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-blue-500"></span>
                      Consignee (Receiver)
                    </span>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">flight_land</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receiver Name</label>
                      <input 
                        type="text" 
                        name="receiverName" 
                        value={formData.receiverName} 
                        onChange={handleChange} 
                        placeholder="Receiver name" 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none shadow-2xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receiver Email</label>
                      <input 
                        type="email" 
                        name="receiverEmail" 
                        value={formData.receiverEmail} 
                        onChange={handleChange} 
                        placeholder="email@domain.com" 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none shadow-2xs" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Street Address</label>
                    <input 
                      type="text" 
                      name="receiverAddress" 
                      value={formData.receiverAddress} 
                      onChange={handleChange} 
                      placeholder="e.g. 14 Baker Street, London" 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none shadow-2xs" 
                    />
                  </div>
                  <div>
                    <AutocompleteInput 
                      label="Destination City & Country (Pinned Map Hub)" 
                      name="destination" 
                      value={formData.destination} 
                      onChange={handleChange} 
                      placeholder="e.g. London, UK" 
                      required 
                      icon="flight_land"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Card 3: Cargo Details & Dual Photo/Video Media */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">inventory_2</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cargo Contents & Dates</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Package Contents</label>
                  <input 
                    type="text" 
                    name="packageName" 
                    value={formData.packageName} 
                    onChange={handleChange} 
                    placeholder="e.g. Precision Medical Sensors" 
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none shadow-2xs" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shipment Dispatch Date</label>
                  <input 
                    type="date" 
                    name="shipDate" 
                    value={formData.shipDate} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none shadow-2xs" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estimated Arrival (ETA)</label>
                  <input 
                    type="date" 
                    name="eta" 
                    value={formData.eta} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none shadow-2xs" 
                  />
                </div>
              </div>

              {/* DUAL PHOTO & VIDEO UPLOAD SECTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Cargo Inspection Media (Photo or Video)
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>Image & Video Supported</span>
                  </div>
                </div>

                {!formData.packageImage ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group bg-white shadow-2xs">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={handleMediaUpload} 
                      className="hidden" 
                    />
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-2xs">
                        <span className="material-symbols-outlined text-2xl">photo_library</span>
                      </div>
                      <span className="text-slate-300 text-lg font-light">+</span>
                      <div className="size-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-2xs">
                        <span className="material-symbols-outlined text-2xl">videocam</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      Click to upload cargo inspection photo or video
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Accepts JPG, PNG, WEBP, MP4, WEBM, MOV • Max 25 MB
                    </p>
                  </label>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                    {/* Media Preview Player/Thumbnail */}
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative flex items-center justify-center">
                      {formData.packageMediaType === 'video' || (typeof formData.packageImage === 'string' && formData.packageImage.startsWith('data:video')) ? (
                        <video 
                          src={formData.packageImage} 
                          controls 
                          playsInline
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={formData.packageImage} 
                          alt="Cargo Preview" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-xs pointer-events-none">
                        <span className="size-1.5 rounded-full bg-emerald-400"></span>
                        {formData.packageMediaType === 'video' ? 'Video File' : 'Photo File'}
                      </div>
                    </div>

                    {/* Media Details & Actions */}
                    <div className="flex-1 w-full flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {formData.packageMediaName || (formData.packageMediaType === 'video' ? 'Cargo Inspection Video' : 'Cargo Inspection Photo')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          Active cargo media file ready for inspection on the live tracking page.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 mt-3 sm:mt-4">
                        <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs">
                          <input 
                            type="file" 
                            accept="image/*,video/*" 
                            onChange={handleMediaUpload} 
                            className="hidden" 
                          />
                          <span className="material-symbols-outlined text-[15px]">sync</span>
                          <span>Replace</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={handleRemoveMedia}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Overall Status */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-200/60">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">track_changes</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Transit Status</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { value: 'In Transit', label: 'In Transit', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
                  { value: 'Customs Hold', label: 'Customs Hold', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
                  { value: 'Delivered', label: 'Delivered', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
                  { value: 'Pending', label: 'Processing / Pending', color: 'text-slate-700 bg-slate-100 border-slate-200', dot: 'bg-slate-400' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.status === opt.value
                        ? `${opt.color} ring-2 ring-emerald-500/20 shadow-xs font-extrabold`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <span className={`size-2 rounded-full ${opt.dot}`}></span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {formData.status === 'Customs Hold' && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">warning</span>
                  <p className="text-xs text-amber-800 font-medium">
                    This shipment will prompt consignees for outstanding customs clearance on the public tracking page.
                  </p>
                </div>
              )}
            </div>

            {/* Card 5: Timeline Events */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">timeline</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Milestone Timeline Events</h3>
                </div>
                <button 
                  type="button" 
                  onClick={addTimelineEvent} 
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.customHistory.map((event, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-xl p-3.5 sm:p-4 transition-all relative ${
                      event.state === 'current' 
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' 
                        : 'border-slate-200 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 mb-2.5">
                      <div className="sm:col-span-3">
                        <input 
                          type="date" 
                          value={event.date} 
                          onChange={e => updateTimelineEvent(index, 'date', e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input 
                          type="time" 
                          value={event.time} 
                          onChange={e => updateTimelineEvent(index, 'time', e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select 
                          value={event.status} 
                          onChange={e => updateTimelineEvent(index, 'status', e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Departed">Departed</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Customs Inspection">Customs Inspection</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <input 
                          type="text" 
                          placeholder="Hub / Facility location" 
                          value={event.location} 
                          onChange={e => updateTimelineEvent(index, 'location', e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" 
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2.5">
                      <input 
                        type="text" 
                        placeholder="Milestone description note (visible in full audit log)" 
                        value={event.description} 
                        onChange={e => updateTimelineEvent(index, 'description', e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none" 
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          onClick={() => setTimelineCurrentStep(index)} 
                          className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            event.state === 'current' 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {event.state === 'current' && <span className="material-symbols-outlined text-[14px]">check</span>}
                          <span>{event.state === 'current' ? 'Current Active Step' : 'Set as Current Step'}</span>
                        </button>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeTimelineEvent(index)} 
                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"
                        title="Delete milestone"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.customHistory.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-white shadow-2xs">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-1 block">route</span>
                    <p className="text-xs font-bold text-slate-600">No custom milestones added</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      If left empty, a standard intelligent timeline will be auto-generated based on the origin, destination, and status.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer text-xs sm:text-sm active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="manifest-form" 
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 shadow-md hover:bg-slate-800 transition-all cursor-pointer text-xs sm:text-sm active:scale-95"
          >
            {editItem ? 'Save Manifest Changes' : 'Create Shipment'}
          </button>
        </div>

      </div>
    </div>
  );
}
