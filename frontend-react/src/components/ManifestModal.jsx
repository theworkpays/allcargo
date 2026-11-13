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

const AutocompleteInput = ({ label, name, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredHubs = LOGISTICS_HUBS.filter(hub => 
    hub.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={(e) => { onChange(e); setIsOpen(true); }} 
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none shadow-sm placeholder:text-slate-400 font-medium" 
        placeholder={placeholder} 
        required={required} 
        autoComplete="off"
      />
      {isOpen && value && filteredHubs.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar">
          {filteredHubs.map(hub => (
             <div 
               key={hub} 
               onClick={() => {
                 onChange({ target: { name, value: hub } });
                 setIsOpen(false);
               }}
               className="px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0 font-medium flex items-center gap-2"
             >
               <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
               {hub}
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
    mapStyle: '3D animated route (default)',
    packageName: '',
    shipDate: '',
    eta: '',
    status: 'In Transit', 
    transportMode: 'Air',
    customHistory: [],
    packageImage: null
  });

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
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
          mapStyle: editItem.mapStyle || '3D animated route (default)',
          packageName: editItem.packageName || '',
          shipDate: editItem.shipDate || '',
          eta: editItem.eta || '',
          status: editItem.status || 'In Transit',
          transportMode: editItem.transportMode || 'Air',
          customHistory: editItem.customHistory || [],
          packageImage: editItem.packageImage || null
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
      customHistory: [...prev.customHistory, { date: '', time: '', status: 'Pending', location: '', description: '', state: 'upcoming' }]
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1000 * 1024) { 
       alert('Image is too large. Please select an image under 1MB.');
       return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
       setFormData(prev => ({ ...prev, packageImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-4xl shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-[24px]">
          <div>
            <h2 className="text-slate-900 font-bold text-2xl tracking-tight">
              {editItem ? 'Edit Manifest' : 'New shipment'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Create a new tracking code with shipment details and timeline events.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer bg-white rounded-full p-2 border border-slate-200 hover:bg-slate-100">
            <span className="material-symbols-outlined text-[20px] block">close</span>
          </button>
        </div>
        
        {/* Scrollable Form Body */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white rounded-b-[24px]">
          <form id="manifest-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Top Grid: Tracking, Service, Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tracking number *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" name="id" value={formData.id} onChange={handleChange}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-green-500 outline-none shadow-sm min-w-0" 
                    required readOnly={!!editItem} 
                  />
                  {!editItem && (
                    <button type="button" onClick={generateId} className="px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm shrink-0 cursor-pointer">
                      Regen
                    </button>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Service type</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-bold focus:border-green-500 outline-none shadow-sm">
                  <option value="Allcargo International Priority">International Priority</option>
                  <option value="Allcargo Standard">Standard Transport</option>
                  <option value="Allcargo Express">Express Air</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Weight</label>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="2.5 lb" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
              </div>
            </div>

            {/* Sender / Receiver Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* SENDER COLUMN */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">SENDER</h4>
                <div>
                  <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Sender name" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
                </div>
                <div className="relative z-50">
                  <AutocompleteInput label="" name="origin" value={formData.origin} onChange={handleChange} placeholder="Sender location (city, country)" required />
                </div>
              </div>

              {/* RECEIVER COLUMN */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">RECEIVER</h4>
                <div>
                  <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="Receiver name" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
                </div>
                <div>
                  <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleChange} placeholder="Receiver email (for notification)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
                </div>
                <div>
                  <input type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} placeholder="Receiver address" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
                </div>
                <div className="relative z-40">
                  <AutocompleteInput label="" name="destination" value={formData.destination} onChange={handleChange} placeholder="Receiver location (city, country)" required />
                </div>
              </div>

            </div>

            {/* Map Style */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Map style</label>
              <select name="mapStyle" value={formData.mapStyle} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-900 focus:border-green-500 outline-none shadow-sm">
                <option value="3D animated route (default)">3D animated route (default)</option>
                <option value="Standard 2D map">Standard 2D map</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed">
                The real-world map shows an actual map with the route. It needs a pinned Sender + Receiver location above -- pick them from the dropdown suggestions so the coordinates are saved.
              </p>
            </div>

            {/* Package details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Package name</label>
                <input type="text" name="packageName" value={formData.packageName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ship date</label>
                <input type="date" name="shipDate" value={formData.shipDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Estimated arrival</label>
                <input type="date" name="eta" value={formData.eta} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-green-500 outline-none shadow-sm" />
              </div>
            </div>

            {/* Package media */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Package media</label>
              <div className="flex items-start gap-4">
                <label className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer group relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {formData.packageImage ? (
                    <img src={formData.packageImage} alt="Package" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-2xl group-hover:text-green-500 transition-colors">upload</span>
                      <span className="text-[10px] font-bold mt-2">Upload image</span>
                    </>
                  )}
                </label>
                <div className="flex flex-col mt-2">
                  <p className="text-[10px] text-slate-400">Max 1 MB. Stored natively in Ledger.</p>
                  {formData.packageImage && (
                    <button type="button" onClick={() => setFormData(prev => ({...prev, packageImage: null}))} className="text-[10px] text-red-500 font-bold hover:underline self-start mt-2 cursor-pointer">
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Panel */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-orange-500">warning</span>
              <p className="text-sm font-medium text-orange-800">
                Set up at least one payment method on the <a href="#" className="font-bold underline decoration-orange-300 hover:decoration-orange-500">Billing</a> panel before visitors can pay for outstanding customs holds.
              </p>
            </div>

            {/* Overall Status */}
            <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Overall Status</label>
               <select name="status" value={formData.status} onChange={handleChange} className="w-full md:w-1/3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-900 focus:border-green-500 outline-none shadow-sm">
                 <option value="In Transit">In Transit</option>
                 <option value="Pending">Pending</option>
                 <option value="Customs Hold">Customs Hold</option>
                 <option value="Delivered">Delivered</option>
               </select>
            </div>

            {/* TIMELINE EVENTS */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">TIMELINE EVENTS</h4>
                <button type="button" onClick={addTimelineEvent} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 cursor-pointer shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">add</span> Add event
                </button>
              </div>

              <div className="space-y-4">
                {formData.customHistory.map((event, index) => (
                  <div key={index} className={`border-2 rounded-xl p-4 transition-all relative ${event.state === 'current' ? 'border-green-500 bg-green-50/30' : 'border-slate-200 bg-white'}`}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                      <div className="md:col-span-3">
                        <input type="date" value={event.date} onChange={e => updateTimelineEvent(index, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-medium text-slate-900 focus:border-green-500 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <input type="time" value={event.time} onChange={e => updateTimelineEvent(index, 'time', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-medium text-slate-900 focus:border-green-500 outline-none" />
                      </div>
                      <div className="md:col-span-3">
                        <select value={event.status} onChange={e => updateTimelineEvent(index, 'status', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-bold text-slate-900 focus:border-green-500 outline-none">
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Departed">Departed</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Customs Inspection">Customs Inspection</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <input type="text" placeholder="Location" value={event.location} onChange={e => updateTimelineEvent(index, 'location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-medium text-slate-900 focus:border-green-500 outline-none" />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <input type="text" placeholder="Description (visible when this is the current step)" value={event.description} onChange={e => updateTimelineEvent(index, 'description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-medium text-slate-900 focus:border-green-500 outline-none" />
                    </div>

                    {event.state === 'current' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
                        <label className="flex items-center gap-2 text-xs text-orange-900 font-medium mb-1">
                          <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> Charge for this event
                        </label>
                        <a href="#" className="text-[10px] text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1">Add a payment method in Billing to charge for events <span className="material-symbols-outlined text-[12px]">arrow_forward</span></a>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setTimelineCurrentStep(index)} className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors ${event.state === 'current' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {event.state === 'current' && <span className="material-symbols-outlined text-[14px]">check</span>}
                          Current step
                        </button>
                        <label className="flex items-center gap-2 text-xs text-slate-500 font-medium cursor-pointer">
                          <input type="checkbox" className="rounded text-slate-900 focus:ring-slate-900" /> Auto-advance
                        </label>
                      </div>
                      <button type="button" onClick={() => removeTimelineEvent(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 flex items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.customHistory.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">linear_scale</span>
                    <p className="text-sm font-medium text-slate-500">No custom events added.</p>
                    <p className="text-xs text-slate-400 mt-1">If left empty, a standard timeline will be auto-generated.</p>
                  </div>
                )}
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-[24px] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer text-sm">
            Cancel
          </button>
          <button type="submit" form="manifest-form" className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all cursor-pointer text-sm">
            {editItem ? 'Save changes' : 'Create shipment'}
          </button>
        </div>

      </div>
    </div>
  );
}
