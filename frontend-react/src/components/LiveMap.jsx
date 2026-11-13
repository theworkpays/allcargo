import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';
import { geoInterpolate } from 'd3-geo';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function LiveMap({ 
  origin, 
  destination, 
  originName, 
  destinationName, 
  current, 
  carrier, 
  type = 'Air Freight', 
  status = 'In Transit' 
}) {
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.2 });
  const [targetPosition, setTargetPosition] = useState({ coordinates: [0, 20], zoom: 1.2 });
  const [vehiclePos, setVehiclePos] = useState(origin || [0,0]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!origin || !destination) return;
    
    let p = 0;
    let animationFrameId;
    const interpolator = geoInterpolate(origin, destination);

    const animate = () => {
      if (status === 'In Transit' || status === 'Processing') {
        p += 0.002;
        if (p > 1) p = 0;
        
        const nextPos = interpolator(p);
        const prevPos = interpolator(p - 0.002 < 0 ? 0 : p - 0.002);
        
        const dx = nextPos[0] - prevPos[0];
        const dy = nextPos[1] - prevPos[1];
        if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
          const mathAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          setRotation(45 - mathAngle);
        }
        
        setVehiclePos(nextPos);
        
        animationFrameId = requestAnimationFrame(animate);
      } else if (status === 'Delivered') {
        setVehiclePos(destination);
      } else if (status === 'Customs Hold') {
        setVehiclePos(interpolator(0.5));
      } else {
        setVehiclePos(origin);
      }
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [origin, destination, status]);

  useEffect(() => {
    if (origin && destination) {
       const mid = [(origin[0] + destination[0])/2, (origin[1] + destination[1])/2];
       setTargetPosition({ coordinates: mid, zoom: 2.2 });
    }
  }, [origin, destination]);

  useEffect(() => {
    let animationFrameId;
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const animate = () => {
      setPosition(prev => {
        const nextX = lerp(prev.coordinates[0], targetPosition.coordinates[0], 0.06);
        const nextY = lerp(prev.coordinates[1], targetPosition.coordinates[1], 0.06);
        const nextZoom = lerp(prev.zoom, targetPosition.zoom, 0.06);
        
        if (
          Math.abs(nextX - targetPosition.coordinates[0]) < 0.01 &&
          Math.abs(nextY - targetPosition.coordinates[1]) < 0.01 &&
          Math.abs(nextZoom - targetPosition.zoom) < 0.01
        ) {
          return targetPosition; 
        }
        
        return { coordinates: [nextX, nextY], zoom: nextZoom };
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPosition]);

  function handleZoomIn() {
    setTargetPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  }

  function handleZoomOut() {
    setTargetPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  }

  function handleReset() {
    if (origin && destination) {
       const mid = [(origin[0] + destination[0])/2, (origin[1] + destination[1])/2];
       setTargetPosition({ coordinates: mid, zoom: 2.2 });
    } else {
       setTargetPosition({ coordinates: [0, 20], zoom: 1.5 });
    }
  }

  return (
    <div className="relative w-full h-full bg-[#e8f2f9] rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
      <div className="flex-grow w-full h-full relative">
        <ComposableMap projectionConfig={{ scale: 160 }} style={{ width: "100%", height: "100%" }}>
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates} 
            onMoveEnd={(pos) => { setPosition(pos); setTargetPosition(pos); }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography 
                    key={geo.rsmKey} 
                    geography={geo} 
                    fill="#ffffff" 
                    stroke="#cbd5e1" 
                    strokeWidth={0.5} 
                    style={{ 
                      default: { outline: "none" }, 
                      hover: { outline: "none", fill: "#f1f5f9" }, 
                      pressed: { outline: "none" } 
                    }} 
                  />
                ))
              }
            </Geographies>

            {origin && destination && (
              <>
                <style>{`
                  @keyframes dashFlow {
                    to { stroke-dashoffset: -8; }
                  }
                  .animate-dash-flow {
                    animation: dashFlow 1s linear infinite;
                  }
                `}</style>
                
                {/* Dotted Line Route */}
                <Line
                  from={origin}
                  to={destination}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  className={status === 'In Transit' ? "animate-dash-flow" : ""}
                />
                
                {/* Origin Marker */}
                <Marker coordinates={origin}>
                  <g transform="translate(-12, -24)">
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" fill="#10b981" stroke="#fff" strokeWidth={1.5} />
                    <circle cx="12" cy="10" r="3" fill="#fff" />
                  </g>
                  <foreignObject x="-60" y="8" width="120" height="48" style={{ overflow: 'visible' }}>
                      <div className="bg-white px-2 py-1 rounded-md shadow-md border border-slate-100 text-[10px] font-bold text-slate-900 text-center leading-tight mx-auto max-w-[95px] whitespace-normal">
                        {originName || 'Origin'}<br/><span className="text-slate-400 font-normal">Origin</span>
                      </div>
                  </foreignObject>
                </Marker>
                
                {/* Destination Marker */}
                <Marker coordinates={destination}>
                  <g transform="translate(-12, -24)">
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
                    <circle cx="12" cy="10" r="3" fill="#fff" />
                  </g>
                  <foreignObject x="-60" y="8" width="120" height="48" style={{ overflow: 'visible' }}>
                      <div className="bg-white px-2 py-1 rounded-md shadow-md border border-slate-100 text-[10px] font-bold text-slate-900 text-center leading-tight mx-auto max-w-[95px] whitespace-normal">
                        {destinationName || 'Destination'}<br/><span className="text-slate-400 font-normal">Destination</span>
                      </div>
                  </foreignObject>
                </Marker>
                
                {/* Vehicle Marker */}
                <Marker coordinates={vehiclePos}>
                  <g transform="translate(-10, -10)">
                     <circle cx="10" cy="10" r="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1" className="shadow-sm" />
                     <path d="M9.5,4L9.5,10.5L14,12L14,13.5L9.5,12L9.5,15.5L10.5,16.5L10.5,17.5L8,16.5L5.5,17.5L5.5,16.5L6.5,15.5L6.5,12L2,13.5L2,12L6.5,10.5L6.5,4C6.5,3.17 7.17,2.5 8,2.5C8.83,2.5 9.5,3.17 9.5,4Z" 
                           fill={status === 'Customs Hold' ? '#f59e0b' : status === 'Delivered' ? '#64748b' : '#10b981'} />
                  </g>
                </Marker>
              </>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Map Controls */}
      <div className="absolute left-4 bottom-16 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden z-10">
          <button onClick={() => setTargetPosition(p => ({ ...p, zoom: Math.min(p.zoom * 2, 8) }))} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-100 cursor-pointer"><span className="material-symbols-outlined text-sm">add</span></button>
          <button onClick={() => setTargetPosition(p => ({ ...p, zoom: Math.max(p.zoom / 2, 1) }))} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-100 cursor-pointer"><span className="material-symbols-outlined text-sm">remove</span></button>
          <button onClick={() => {
            if (origin && destination) {
              const mid = [(origin[0] + destination[0])/2, (origin[1] + destination[1])/2];
              setTargetPosition({ coordinates: mid, zoom: 2.2 });
            } else {
              setTargetPosition({ coordinates: [0, 0], zoom: 1 });
            }
          }} className="size-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"><span className="material-symbols-outlined text-sm">my_location</span></button>
      </div>
      
      {/* Legend */}
      <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-4 text-[10px] font-bold text-slate-600 z-10">
        <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-green-500"></div> In Transit</div>
        <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-blue-500"></div> Origin / Destination</div>
        <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-slate-300"></div> Pending</div>
      </div>
    </div>
  );
}
