import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from 'react-simple-maps';
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
  // Compute optimal center and zoom based on origin and destination
  const getOptimalView = useCallback((orig, dest) => {
    if (!orig || !dest) return { coordinates: [20, 20], zoom: 1.2 };
    
    let midLon = (orig[0] + dest[0]) / 2;
    let midLat = (orig[1] + dest[1]) / 2;
    
    // Handle wrap-around across antimeridian if needed
    let lonDiff = Math.abs(orig[0] - dest[0]);
    if (lonDiff > 180) {
      lonDiff = 360 - lonDiff;
      midLon = (orig[0] + dest[0] + 360) / 2;
      if (midLon > 180) midLon -= 360;
    }
    
    const latDiff = Math.abs(orig[1] - dest[1]);
    const maxSpan = Math.max(lonDiff, latDiff * 1.35);
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    let optimalZoom = 2.0;
    if (maxSpan > 110) optimalZoom = isMobile ? 1.3 : 1.7;
    else if (maxSpan > 75) optimalZoom = isMobile ? 1.6 : 2.1;
    else if (maxSpan > 45) optimalZoom = isMobile ? 2.0 : 2.6;
    else if (maxSpan > 20) optimalZoom = isMobile ? 2.6 : 3.4;
    else optimalZoom = isMobile ? 3.2 : 4.2;

    return { coordinates: [midLon, midLat], zoom: optimalZoom };
  }, []);

  const initialView = useMemo(() => getOptimalView(origin, destination), [origin, destination, getOptimalView]);

  const [position, setPosition] = useState(initialView);
  const [targetPosition, setTargetPosition] = useState(initialView);
  const [vehiclePos, setVehiclePos] = useState(origin || [0, 0]);
  const [rotation, setRotation] = useState(0);

  // Update target when route coordinates change
  useEffect(() => {
    if (origin && destination) {
      const optimal = getOptimalView(origin, destination);
      setTargetPosition(optimal);
    }
  }, [origin, destination, getOptimalView]);

  // Smooth lerp animation to target position (camera movement)
  useEffect(() => {
    let animationFrameId;
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const animateCamera = () => {
      setPosition(prev => {
        const nextX = lerp(prev.coordinates[0], targetPosition.coordinates[0], 0.08);
        const nextY = lerp(prev.coordinates[1], targetPosition.coordinates[1], 0.08);
        const nextZoom = lerp(prev.zoom, targetPosition.zoom, 0.08);
        
        if (
          Math.abs(nextX - targetPosition.coordinates[0]) < 0.01 &&
          Math.abs(nextY - targetPosition.coordinates[1]) < 0.01 &&
          Math.abs(nextZoom - targetPosition.zoom) < 0.01
        ) {
          return targetPosition; 
        }
        
        animationFrameId = requestAnimationFrame(animateCamera);
        return { coordinates: [nextX, nextY], zoom: nextZoom };
      });
    };
    
    animateCamera();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPosition]);

  // Vehicle trajectory animation
  useEffect(() => {
    if (!origin || !destination) return;
    
    let p = 0;
    let animationFrameId;
    const interpolator = geoInterpolate(origin, destination);

    const animateVehicle = () => {
      if (status === 'In Transit' || status === 'Processing') {
        p += 0.0016;
        if (p > 1) p = 0;
        
        const nextPos = interpolator(p);
        const prevPos = interpolator(Math.max(0, p - 0.003));
        
        const dx = nextPos[0] - prevPos[0];
        const dy = nextPos[1] - prevPos[1];
        if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
          const heading = (Math.atan2(dx, dy) * 180) / Math.PI;
          setRotation(heading);
        }
        
        setVehiclePos(nextPos);
        animationFrameId = requestAnimationFrame(animateVehicle);
      } else if (status === 'Delivered') {
        setVehiclePos(destination);
        const prev = interpolator(0.99);
        setRotation((Math.atan2(destination[0] - prev[0], destination[1] - prev[1]) * 180) / Math.PI);
      } else if (status === 'Customs Hold') {
        setVehiclePos(interpolator(0.5));
        const prev = interpolator(0.49);
        const next = interpolator(0.51);
        setRotation((Math.atan2(next[0] - prev[0], next[1] - prev[1]) * 180) / Math.PI);
      } else {
        setVehiclePos(origin);
        const next = interpolator(0.01);
        setRotation((Math.atan2(next[0] - origin[0], next[1] - origin[1]) * 180) / Math.PI);
      }
    };
    
    animateVehicle();
    return () => cancelAnimationFrame(animationFrameId);
  }, [origin, destination, status]);

  const handleZoomIn = () => {
    setTargetPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.45, 8) }));
  };

  const handleZoomOut = () => {
    setTargetPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.45, 1) }));
  };

  const handleReset = () => {
    const optimal = getOptimalView(origin, destination);
    setTargetPosition(optimal);
  };

  const isSeaFreight = type && (type.toLowerCase().includes('sea') || type.toLowerCase().includes('ocean'));
  const isLandFreight = type && (type.toLowerCase().includes('road') || type.toLowerCase().includes('land') || type.toLowerCase().includes('truck'));

  const vehicleColor = status === 'Customs Hold' ? '#f59e0b' : status === 'Delivered' ? '#64748b' : '#10b981';
  const speedLabel = isSeaFreight ? '19 KTS' : isLandFreight ? '65 MPH' : '540 KTS';

  const origDisplay = originName ? originName.split(',')[0].trim() : 'Origin';
  const destDisplay = destinationName ? destinationName.split(',')[0].trim() : 'Destination';

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#edf4f9] via-[#e5eef5] to-[#deebf3] rounded-2xl overflow-hidden border border-slate-100 flex flex-col select-none">
      
      {/* Top Left: Live Status HUD Tag */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-tight">GPS Telemetry</span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-[9px] sm:text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            {status === 'In Transit' ? 'ACTIVE' : status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Map SVG Canvas */}
      <div className="flex-grow w-full h-full relative">
        <ComposableMap projectionConfig={{ scale: 155 }} style={{ width: "100%", height: "100%" }}>
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
                    fill="#fcfdfd" 
                    stroke="#cbd5e1" 
                    strokeWidth={0.55} 
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
                    to { stroke-dashoffset: -12; }
                  }
                  .animate-dash-flow {
                    animation: dashFlow 1.2s linear infinite;
                  }
                `}</style>
                
                {/* Glowing Under-Route Line */}
                <Line
                  from={origin}
                  to={destination}
                  stroke="#10b981"
                  strokeWidth={5}
                  strokeOpacity={0.16}
                  strokeLinecap="round"
                />

                {/* Dotted Animated Active Route Line */}
                <Line
                  from={origin}
                  to={destination}
                  stroke="#10b981"
                  strokeWidth={2.2}
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  className={status === 'In Transit' ? "animate-dash-flow" : ""}
                />
                
                {/* Origin Marker */}
                <Marker coordinates={origin}>
                  <g transform="translate(-10, -22)" className="cursor-pointer">
                    <circle cx="10" cy="22" r="3" fill="#10b981" opacity="0.3">
                      <animate attributeName="r" from="3" to="8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <path 
                      d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 12 10 12s10-4.5 10-12c0-5.52-4.48-10-10-10z" 
                      fill="#10b981" 
                      stroke="#ffffff" 
                      strokeWidth={1.5}
                    />
                    <circle cx="10" cy="9.5" r="2.8" fill="#ffffff" />
                  </g>
                  
                  {/* Floating Origin City Label */}
                  <foreignObject x="-55" y="4" width="110" height="38" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                    <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/90 text-center mx-auto w-fit select-none">
                      <div className="flex items-center justify-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          {origDisplay}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block leading-tight">
                        Origin Hub
                      </span>
                    </div>
                  </foreignObject>
                </Marker>
                
                {/* Destination Marker */}
                <Marker coordinates={destination}>
                  <g transform="translate(-10, -22)" className="cursor-pointer">
                    <circle cx="10" cy="22" r="3" fill="#3b82f6" opacity="0.3">
                      <animate attributeName="r" from="3" to="8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <path 
                      d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 12 10 12s10-4.5 10-12c0-5.52-4.48-10-10-10z" 
                      fill="#3b82f6" 
                      stroke="#ffffff" 
                      strokeWidth={1.5}
                    />
                    <circle cx="10" cy="9.5" r="2.8" fill="#ffffff" />
                  </g>
                  
                  {/* Floating Destination City Label */}
                  <foreignObject x="-55" y="4" width="110" height="38" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                    <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/90 text-center mx-auto w-fit select-none">
                      <div className="flex items-center justify-center gap-1">
                        <span className="size-1.5 rounded-full bg-blue-500"></span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          {destDisplay}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider block leading-tight">
                        Destination
                      </span>
                    </div>
                  </foreignObject>
                </Marker>
                
                {/* Moving Vehicle Marker with Live Telemetry Tag */}
                <Marker coordinates={vehiclePos}>
                  <g transform="translate(-16, -16)">
                    {/* Expanding Radar Sonar Waves */}
                    {status === 'In Transit' && (
                      <>
                        <circle cx="16" cy="16" r="14" fill="#10b981" opacity="0.18">
                          <animate attributeName="r" from="14" to="26" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.35" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="16" cy="16" r="14" fill="#10b981" opacity="0.18">
                          <animate attributeName="r" from="14" to="26" dur="2s" begin="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.35" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    
                    {/* Vehicle Circular Base */}
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="13" 
                      fill="#ffffff" 
                      stroke="#e2e8f0" 
                      strokeWidth={1.5} 
                      className="shadow-md" 
                    />
                    
                    {/* Rotating Vehicle Icon */}
                    <g transform={`rotate(${rotation}, 16, 16)`}>
                      {isSeaFreight ? (
                        <g transform="translate(6, 6) scale(0.85)">
                          <path 
                            d="M3 13L5 18H19L21 13H3ZM6 11H18V10C18 9.45 17.55 9 17 9H7C6.45 9 6 9.45 6 10V11ZM8 7H16V6C16 5.45 15.55 5 15 5H9C8.45 5 8 5.45 8 6V7Z" 
                            fill={vehicleColor} 
                          />
                        </g>
                      ) : isLandFreight ? (
                        <g transform="translate(6, 6) scale(0.85)">
                          <path 
                            d="M18 11V6H3V16H5C5 17.66 6.34 19 8 19C9.66 19 11 17.66 11 16H15C15 17.66 16.34 19 18 19C19.66 19 21 17.66 21 16H22V13L19.5 9.5H18V11ZM8 17.5C7.17 17.5 6.5 16.83 6.5 16C6.5 15.17 7.17 14.5 8 14.5C8.83 14.5 9.5 15.17 9.5 16C9.5 16.83 8.83 17.5 8 17.5ZM18 17.5C17.17 17.5 16.5 16.83 16.5 16C16.5 15.17 17.17 14.5 18 14.5C18.83 14.5 19.5 15.17 19.5 16C19.5 16.83 18.83 17.5 18 17.5Z" 
                            fill={vehicleColor} 
                          />
                        </g>
                      ) : (
                        <g transform="translate(4, 4)">
                          <path 
                            d="M12,1.5 C11.5,1.5 10.9,2.8 10.9,5.5 L10.9,9.2 L2.2,14.6 C1.8,14.8 1.6,15.3 1.7,15.7 C1.9,16.2 2.4,16.5 2.9,16.4 L10.9,14.2 L10.9,19.2 L7.8,21.6 C7.5,21.8 7.3,22.2 7.4,22.6 C7.5,23.0 7.9,23.3 8.3,23.2 L12,22.4 L15.7,23.2 C16.1,23.3 16.5,23.0 16.6,22.6 C16.7,22.2 16.5,21.8 16.2,21.6 L13.1,19.2 L13.1,14.2 L21.1,16.4 C21.6,16.5 22.1,16.2 22.3,15.7 C22.4,15.3 22.2,14.8 21.8,14.6 L13.1,9.2 L13.1,5.5 C13.1,2.8 12.5,1.5 12,1.5 Z" 
                            fill={vehicleColor} 
                          />
                        </g>
                      )}
                    </g>
                  </g>

                  {/* Dynamic Floating Telemetry Callout */}
                  <foreignObject x="-42" y="-30" width="84" height="24" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                    <div className="bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md border border-slate-700/60 flex items-center justify-center gap-1 mx-auto w-fit">
                      <span className="size-1 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[9px] font-mono font-bold text-white tracking-wide">
                        {status === 'In Transit' ? speedLabel : status}
                      </span>
                    </div>
                  </foreignObject>
                </Marker>
              </>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Bottom Right: Sleek Zoom Controls */}
      <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-sm flex flex-col overflow-hidden z-10">
        <button 
          onClick={handleZoomIn} 
          title="Zoom In" 
          aria-label="Zoom in"
          className="size-8 sm:size-8.5 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 border-b border-slate-100 transition-colors cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
        </button>
        <button 
          onClick={handleZoomOut} 
          title="Zoom Out" 
          aria-label="Zoom out"
          className="size-8 sm:size-8.5 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 border-b border-slate-100 transition-colors cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">remove</span>
        </button>
        <button 
          onClick={handleReset} 
          title="Recenter Route" 
          aria-label="Recenter map route"
          className="size-8 sm:size-8.5 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">my_location</span>
        </button>
      </div>
      
      {/* Bottom Left: Sleek Legend */}
      <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-1.5 sm:py-2 shadow-xs flex items-center gap-3 sm:gap-4 text-[10px] font-bold text-slate-600 z-10">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 shadow-2xs"></span>
          <span>In Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500 shadow-2xs"></span>
          <span>Destination</span>
        </div>
        <div className="hidden xs:flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-300"></span>
          <span>Origin Hub</span>
        </div>
      </div>
    </div>
  );
}
