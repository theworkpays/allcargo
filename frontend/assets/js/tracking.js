/**
 * TRACKING PAGE LOGIC - ADVANCED VISUALS
 */

// --- 1. Hero Search Redirect ---
window.submitHeroTracking = function() {
    const input = document.getElementById('hero-track-input');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    
    const db = JSON.parse(localStorage.getItem("allcargo_shipments") || "[]");
    const exists = db.find(item => item.id.toUpperCase() === val);

    if (val.length > 2 && exists) {
        window.location.href = `tracking.html?id=${encodeURIComponent(val)}`;
    } else {
        input.value = "";
        input.placeholder = "ID NOT FOUND...";
        input.classList.add("placeholder-red-400");
        setTimeout(() => input.classList.remove("placeholder-red-400"), 2000);
    }
}

// --- 2. Main Tracking Logic ---
window.handleTrackClick = function() {
    const input = document.getElementById('tracking-input');
    
    const sections = {
        result: document.getElementById('tracking-result'),
        loader: document.getElementById('scanning-loader'),
        card: document.getElementById('result-card'),
        error: document.getElementById('error-card'),
        errText: document.getElementById('error-text')
    };

    if (!input || input.value.trim().length < 2) return alert("Enter a valid ID");

    const searchId = input.value.trim().toUpperCase();

    // Reset UI
    sections.result.classList.remove('hidden');
    sections.loader.classList.remove('hidden');
    sections.card.classList.add('hidden');
    sections.error.classList.add('hidden');
    sections.result.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Simulate Satellite Delay
    setTimeout(() => {
        sections.loader.classList.add('hidden');

        // QUERY DATABASE
        const database = JSON.parse(localStorage.getItem("allcargo_shipments") || "[]");
        const shipment = database.find(item => item.id.toUpperCase() === searchId);

        if (shipment) {
            // --- POPULATE DATA ---
            document.getElementById('display-id').innerHTML = `${shipment.id} <span class="material-symbols-outlined text-primary text-2xl animate-pulse">lock</span>`;
            document.getElementById('display-status').innerText = shipment.status;
            document.getElementById('display-origin').innerText = shipment.origin;
            document.getElementById('display-dest').innerText = shipment.destination;
            document.getElementById('display-weight').innerText = (shipment.weight || "0.00") + " kg";
            document.getElementById('display-cargo').innerText = shipment.cargo || "GENERAL CARGO";
            document.getElementById('display-receiver').innerText = shipment.receiver || "Private Client";
            document.getElementById('display-eta').innerText = shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "CALCULATING...";

            // Status Colors
            const statusEl = document.getElementById('display-status');
            statusEl.className = "text-lg font-bold font-mono uppercase"; // Reset
            if(shipment.status === "Delivered") statusEl.classList.add("text-green-500");
            else if(shipment.status === "Customs") statusEl.classList.add("text-yellow-500");
            else statusEl.classList.add("text-primary");

            // --- ANIMATIONS ---
            generateHistoryLog(shipment);
            updateMapVisuals(shipment);

            sections.card.classList.remove('hidden');
            sections.card.classList.add('animate-fade-in');

        } else {
            sections.error.classList.remove('hidden');
            sections.errText.innerText = `ERROR: Manifest ID "${searchId}" not found in neural ledger.`;
            sections.error.classList.add('animate-fade-in');
        }
    }, 2000);
}

// --- 3. Timeline Generator ---
// --- 3. INTELLIGENT TIMELINE GENERATOR ---
function generateHistoryLog(shipment) {
    const container = document.getElementById('history-container');
    const now = new Date();
    
    // Helper to format past dates (makes history look real)
    const getPastDate = (hoursAgo) => {
        const d = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
        return {
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    };

    // 1. Define the base "Created" event (Every package has this)
    let events = [
        {
            title: "Manifest Created",
            loc: `${shipment.origin} Logistics Center`,
            date: getPastDate(48).date, // Created 48 hours ago
            time: getPastDate(48).time,
            icon: "inventory_2",
            color: "text-slate-400",
            bg: "bg-slate-800 border border-white/10",
            opacity: "opacity-40 grayscale"
        }
    ];

    // 2. Add events based on Current Status Logic
    // Logic: If status is X, add the steps that lead to X
    
    if (shipment.status === "In Transit" || shipment.status === "Customs" || shipment.status === "Delivered") {
        // It has definitely left the origin
        events.unshift({
            title: "Departed Origin Facility",
            loc: `${shipment.origin} Gateway`,
            date: getPastDate(24).date,
            time: getPastDate(24).time,
            icon: "flight_takeoff",
            color: "text-slate-300",
            bg: "bg-slate-800 border border-white/10",
            opacity: "opacity-60"
        });
    }

    if (shipment.status === "Customs") {
        // Add specific Customs Hold event as the latest
        events.unshift({
            title: "Held for Inspection",
            loc: "Border Control / Customs",
            date: "TODAY",
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            icon: "gavel",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border border-yellow-500 text-yellow-500",
            opacity: "opacity-100",
            pulse: true
        });
    } 
    else if (shipment.status === "In Transit") {
        // Add Live Satellite view as latest
        events.unshift({
            title: `Live Transit: ${shipment.location}`,
            loc: "Satellite Telemetry Uplink",
            date: "LIVE",
            time: "NOW",
            icon: "satellite_alt",
            color: "text-primary",
            bg: "bg-primary text-black shadow-neon",
            opacity: "opacity-100",
            pulse: true
        });
    }
    else if (shipment.status === "Delivered") {
        // Add Delivery confirmation
        events.unshift({
            title: "Delivered to Recipient",
            loc: shipment.destination,
            date: "TODAY",
            time: getPastDate(1).time,
            icon: "check_circle",
            color: "text-green-400",
            bg: "bg-green-500 text-black shadow-[0_0_15px_#22c55e]",
            opacity: "opacity-100"
        });
        
        // Add "Out for Delivery" before it
        events.splice(1, 0, {
            title: "Out for Delivery",
            loc: shipment.destination + " Distribution Hub",
            date: "TODAY",
            time: getPastDate(4).time,
            icon: "local_shipping",
            color: "text-slate-300",
            bg: "bg-slate-800",
            opacity: "opacity-80"
        });
    }

    // 3. Render HTML
    let html = '<div class="absolute left-[19px] top-4 bottom-4 w-[2px] border-l-2 border-dashed border-primary/20"></div>';

    events.forEach(e => {
        const pulseEffect = e.pulse ? '<div class="absolute inset-0 rounded-full bg-current opacity-75 animate-ping"></div>' : '';
        const activeGlow = e.pulse ? 'animate-pulse' : '';
        
        html += `
            <div class="relative flex gap-6 pl-4 transition-all duration-700 ${e.opacity} hover:opacity-100 hover:grayscale-0 group">
                <!-- Icon Bubble -->
                <div class="relative size-10 rounded-full flex items-center justify-center z-10 shrink-0 ${e.bg}">
                    ${pulseEffect}
                    <span class="material-symbols-outlined text-sm font-bold relative z-10">${e.icon}</span>
                </div>
                
                <!-- Text Details -->
                <div class="pb-8">
                    <h4 class="text-sm font-bold leading-tight uppercase tracking-wide ${e.color} ${activeGlow}">
                        ${e.title}
                    </h4>
                    <p class="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[10px]">location_on</span>
                        ${e.loc}
                    </p>
                    <p class="text-[9px] text-slate-500 mt-1 font-mono border-l border-white/10 pl-2">
                        ${e.date} • ${e.time}
                    </p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// --- 4. Map Animation Logic ---
function updateMapVisuals(s) {
    const status = s.status.toLowerCase();
    const locationLabel = document.getElementById('map-overlay-location');
    const target = document.getElementById('map-target');
    const progressLine = document.getElementById('map-progress-line');
    const dynamicLabel = document.getElementById('map-dynamic-label');

    locationLabel.innerText = s.location ? s.location.toUpperCase() : "LOCATING...";
    
    let percentage = '10%';
    let label = "ORIGIN";

    if (status.includes('transit')) { percentage = '50%'; label = "IN TRANSIT"; }
    else if (status.includes('hub') || status.includes('customs')) { percentage = '75%'; label = "NEAR HUB"; }
    else if (status.includes('delivered')) { percentage = '90%'; label = "DELIVERED"; }

    // Trigger animation after slight delay for visual effect
    setTimeout(() => {
        target.style.left = percentage;
        progressLine.setAttribute('x2', percentage);
        dynamicLabel.innerText = label;
        
        if (status.includes('delivered')) {
            target.querySelector('.bg-primary').classList.replace('bg-primary', 'bg-green-500');
            progressLine.setAttribute('stroke', '#22c55e');
        }
    }, 500);
}

// Auto-Run from URL
document.addEventListener("DOMContentLoaded", () => {
    if(window.location.pathname.includes('tracking.html')) {
        const id = new URLSearchParams(window.location.search).get('id');
        if(id) {
            const input = document.getElementById('tracking-input');
            if(input) {
                input.value = id;
                setTimeout(window.handleTrackClick, 500);
            }
        }
    }
});