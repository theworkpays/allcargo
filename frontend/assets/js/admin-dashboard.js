/**
 * ALLCARGO COMMAND_OS v2.0
 * The Central Nervous System for the Logistics Dashboard.
 */

// --- DATA KEYS ---
const DB_KEY = "allcargo_shipments";
const VISITOR_KEY = "allcargo_visitors";
const CHAT_KEY = "allcargo_chats"; // New: Shared Chat Storage

// --- STATE MANAGEMENT ---
let map;
let mapMarkers = [];
let activeVisitors = [];
let activeChats = {}; 
let currentChatID = null;
let lastVisitorCount = 0;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initDashboard();
    
    // Start the "Heartbeat" (Real-time syncing)
    setInterval(syncSystemData, 1000); 
    
    // Initial Load
    renderShipments();
    updateStats();
});

// --- LIVE ANALYTICS GRAPH LOGIC ---
function updateTrafficGraph() {
    const container = document.getElementById('live-traffic-graph');
    if(!container) return;

    // 1. Add current visitor count to history
    const currentCount = activeVisitors.length;
    window.trafficHistory.push(currentCount);
    window.trafficHistory.shift(); // Remove oldest

    // 2. Render Bars
    container.innerHTML = window.trafficHistory.map((val, index) => {
        // Calculate height (max 10 visitors = 100% height, scaled)
        const height = Math.min((val * 10) + 5, 100); 
        const opacity = (index + 5) / 25; // Fade effect
        const colorClass = val > 0 ? "bg-primary" : "bg-white/10";
        
        return `<div style="height: ${height}%; opacity: ${opacity}" 
                     class="w-full ${colorClass} rounded-t-sm transition-all duration-300"></div>`;
    }).join('');

    // 3. Update Text Status
    const statusText = document.getElementById('graph-status');
    if(statusText) {
        statusText.innerText = currentCount > 0 ? "RECEIVING DATA" : "NO TRAFFIC";
        statusText.className = currentCount > 0 ? "text-success animate-pulse" : "text-slate-600";
    }
}

// --- 1. CORE SYSTEM LOGIC ---

function initDashboard() {
    // 1. Clear OLD Visitor Data on Admin Load (Starts Fresh)
    localStorage.setItem(VISITOR_KEY, "[]");
    activeVisitors = [];
    
    // 2. Initialize Traffic Graph Data
    window.trafficHistory = new Array(20).fill(0); // Holds last 20 seconds of data

    // 3. Seed Shipments only if empty
    if(!localStorage.getItem(DB_KEY)) {
        const seed = [
            { id: "AH-8942X", origin: "Shanghai", destination: "London", status: "In Transit", location: "34.05N, 118.24W", weight: "450" },
        ];
        localStorage.setItem(DB_KEY, JSON.stringify(seed));
    }
}

function syncSystemData() {
    // --- 1. SYNC VISITORS (Live Signals) ---
    const storedVisitors = JSON.parse(localStorage.getItem(VISITOR_KEY) || "[]");
    
    // Only update DOM if data changed
    if (JSON.stringify(storedVisitors) !== JSON.stringify(activeVisitors)) {
        activeVisitors = storedVisitors;
        renderVisitors();
        
        // Alert if a new visitor arrived
        if (activeVisitors.length > lastVisitorCount && lastVisitorCount !== 0) {
            showToast(`Signal Detected: ${activeVisitors[0].page}`, "info");
            logActivity(`New Connection from ${activeVisitors[0].ip}`);
        }
        lastVisitorCount = activeVisitors.length;
    }

    // --- 2. SYNC CHATS (Comms Uplink) ---
    const storedChats = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    let hasNewMessage = false;

    // Logic to detect if a *NEW* message arrived since the last check
    // This prevents the sound from looping endlessly if you haven't read the message yet
    Object.keys(storedChats).forEach(userId => {
        const remoteChat = storedChats[userId];
        const localChat = activeChats[userId];

        // If the chat is unread by Admin...
        if (remoteChat.unreadByAdmin) {
            // ...and previously we didn't have this chat OR it was read before
            // then this is a fresh alert.
            if (!localChat || !localChat.unreadByAdmin) {
                hasNewMessage = true;
            }
        }
    });

    // Update Local State if changed
    if (JSON.stringify(storedChats) !== JSON.stringify(activeChats)) {
        activeChats = storedChats;
        renderChatList();
        
        // If we are currently inside this specific chat window, refresh the messages instantly
        if (currentChatID && activeChats[currentChatID]) {
            renderChatMessages(currentChatID);
        }
        
        updateSupportBadge();

        // TRIGGER AUDIO NOTIFICATION
        if (hasNewMessage) {
            const audio = document.getElementById('notification-sound');
            if (audio) {
                // Browsers require user interaction first, so we catch errors just in case
                audio.play().catch(e => console.log("Audio blocked: User must interact with dashboard first"));
            }
            showToast("Incoming Transmission Detected", "info");
        }
    }

    // --- 3. UPDATE ANALYTICS ---
    updateStats();
    
    // Update the Live Traffic Graph (The animated bars)
    if (typeof updateTrafficGraph === "function") {
        updateTrafficGraph(); 
    }
}

// --- 2. VIEW NAVIGATION (FIXED LAYOUT BUG) ---
window.switchView = function(viewName) {
    // 1. Hide all views
    ['overview', 'shipments', 'visitors', 'support'].forEach(v => {
        const viewEl = document.getElementById(`view-${v}`);
        const navEl = document.getElementById(`nav-${v}`);

        // Hide the view
        viewEl.classList.add('hidden');
        
        // Reset Nav Button Styles
        navEl.classList.remove('active-nav');
        navEl.classList.add('text-slate-400');
    });

    // 2. Show the selected view
    const selectedView = document.getElementById(`view-${viewName}`);
    selectedView.classList.remove('hidden'); 
    
    // NOTE: We removed the line "selectedView.classList.add('flex')" 
    // because it was squashing the System Overview grid.

    // 3. Highlight the Nav Button
    const activeNav = document.getElementById(`nav-${viewName}`);
    activeNav.classList.add('active-nav');
    activeNav.classList.remove('text-slate-400');

    // 4. Update Page Title
    const titles = { 
        overview: "System Overview", 
        shipments: "Neural Ledger", 
        visitors: "Live Signals", 
        support: "Comms Uplink" 
    };
    document.getElementById('page-title').innerText = titles[viewName];

    // 5. Fix Map resizing glitch if opening Shipments tab
    if(viewName === 'shipments' && map) {
        setTimeout(() => map.invalidateSize(), 300);
    }
}

// --- 3. SHIPMENT MANAGEMENT (Neural Ledger) ---

function getShipments() { return JSON.parse(localStorage.getItem(DB_KEY) || "[]"); }
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); renderShipments(); updateStats(); }

function renderShipments() {
    const data = getShipments();
    const list = document.getElementById('shipment-list');
    const filter = document.getElementById('search-input').value.toUpperCase();
    
    list.innerHTML = "";

    const filteredData = data.filter(item => item.id.includes(filter) || item.origin.toUpperCase().includes(filter));

    if(filteredData.length === 0) {
        list.innerHTML = `<div class="p-8 text-center text-slate-600 font-mono text-xs">NO DATA FOUND IN LEDGER</div>`;
        return;
    }

    filteredData.forEach(item => {
        const el = document.createElement('div');
        el.className = "p-4 glass-panel border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary/30 transition-all group relative overflow-hidden";
        el.onclick = () => showOnMap(item);
        
        let statusColor = "text-slate-400";
        if(item.status === "In Transit") statusColor = "text-primary";
        if(item.status === "Delivered") statusColor = "text-success";
        if(item.status === "Customs") statusColor = "text-warning";

        // Format Date nicely
        const etaDisplay = item.eta ? new Date(item.eta).toLocaleDateString() : "PENDING";

        el.innerHTML = `
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-${statusColor.replace('text-', '')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-white font-display font-bold text-lg tracking-wider block">${item.id}</span>
                    <span class="text-[9px] text-slate-500 uppercase">${item.cargo || 'General Cargo'}</span>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/5 ${statusColor} block mb-1">${item.status}</span>
                    <span class="text-[9px] text-white font-mono">ETA: ${etaDisplay}</span>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-xs text-slate-500 font-mono border-t border-white/5 pt-2 mt-2">
                <span>${item.origin}</span>
                <span class="material-symbols-rounded text-[10px]">arrow_forward</span>
                <span>${item.destination}</span>
            </div>

            <div class="mt-3 flex gap-2 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onclick="editItem('${item.id}', event)" class="flex-1 text-[10px] bg-white/5 hover:bg-primary hover:text-black py-1 rounded transition-colors">EDIT</button>
                <button onclick="deleteItem('${item.id}', event)" class="flex-1 text-[10px] bg-white/5 hover:bg-danger hover:text-white py-1 rounded transition-colors">DELETE</button>
            </div>
        `;
        list.appendChild(el);
    });
}

// Map Interaction
function initMap() {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd', className: 'map-dark'
    }).addTo(map);
}

function showOnMap(item) {
    // Clear old
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];

    // Simulate Coords based on ID length (Consistent MVP trick)
    const lat = (item.id.length * 5) - 30;
    const lng = (item.id.length * 10) - 100;

    // Custom Marker
    const icon = L.divIcon({
        html: `<div class="relative"><div class="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div><span class="material-symbols-rounded text-primary text-3xl drop-shadow-[0_0_15px_rgba(13,242,223,1)]">location_on</span></div>`,
        className: 'bg-transparent',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    const m = L.marker([lat, lng], { icon: icon }).addTo(map);
    mapMarkers.push(m);
    map.flyTo([lat, lng], 5, { duration: 1.5 });

    // Update Detail Card
    const card = document.getElementById('map-detail-card');
    card.classList.remove('hidden');
    card.classList.add('fade-in-up');
    
    document.getElementById('detail-id').innerText = item.id;
    document.getElementById('detail-route').innerText = `${item.origin} -> ${item.destination}`;
    document.getElementById('detail-status').innerText = item.status;
    document.getElementById('detail-loc').innerText = item.location;
}

// --- 4. LIVE VISITOR LOGIC ---
function renderVisitors() {
    const tbody = document.getElementById('visitor-table');
    if(!tbody) return;
    
    tbody.innerHTML = activeVisitors.map(v => `
        <tr class="hover:bg-white/5 transition-colors border-b border-white/5 group">
            <td class="p-4 font-mono text-primary group-hover:text-white transition-colors">${v.ip}</td>
            <td class="p-4 text-white">${v.location}</td>
            <td class="p-4"><span class="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">${v.page}</span></td>
            <td class="p-4 text-slate-500 font-mono text-xs">${v.time}</td>
            <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <div class="h-1 w-8 bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-success w-[80%] animate-pulse"></div>
                    </div>
                    <span class="text-[10px] text-success font-bold">STRONG</span>
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('visitor-count-badge').innerText = activeVisitors.length;
}

// --- 5. COMMS UPLINK (CHAT SYSTEM) ---

function renderChatList() {
    const list = document.getElementById('chat-list');
    list.innerHTML = "";
    
    const chatIDs = Object.keys(activeChats);
    
    if(chatIDs.length === 0) {
        list.innerHTML = `<div class="p-6 text-center text-slate-600 text-xs italic">No transmissions detected.</div>`;
        return;
    }

    chatIDs.forEach(userId => {
        const chat = activeChats[userId];
        const lastMsg = chat.messages[chat.messages.length - 1];
        const isActive = userId === currentChatID ? "bg-primary/10 border-primary/50" : "bg-white/5 border-transparent hover:bg-white/10";
        const hasUnread = chat.unreadByAdmin ? `<span class="size-2 bg-danger rounded-full animate-pulse"></span>` : "";

        const el = document.createElement('div');
        el.className = `p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${isActive}`;
        el.onclick = () => loadChat(userId);
        el.innerHTML = `
            <div>
                <h5 class="text-white font-bold text-xs flex items-center gap-2">
                    ${userId} ${hasUnread}
                </h5>
                <p class="text-[10px] text-slate-400 truncate max-w-[120px]">${lastMsg ? lastMsg.text : '...'}</p>
            </div>
            <span class="text-[9px] text-slate-600 font-mono">${lastMsg ? lastMsg.time : ''}</span>
        `;
        list.appendChild(el);
    });
}

function loadChat(userId) {
    currentChatID = userId;
    
    // --- MOBILE RESPONSIVENESS LOGIC ---
    // On mobile screens, hide the list and show the chat window
    if (window.innerWidth < 768) {
        document.getElementById('chat-list-container').classList.add('hidden');
        const win = document.getElementById('chat-window-container');
        win.classList.remove('hidden');
        win.classList.add('flex'); // Ensure it's visible as a flex container
    }

    // Mark as read
    if(activeChats[userId].unreadByAdmin) {
        activeChats[userId].unreadByAdmin = false;
        localStorage.setItem(CHAT_KEY, JSON.stringify(activeChats));
        updateSupportBadge();
    }

    // Update Header
    document.getElementById('chat-active-user').innerText = userId;
    const status = document.getElementById('chat-active-status');
    status.innerText = "CONNECTION STABLE";
    status.className = "text-[9px] text-success font-mono font-bold animate-pulse";
    
    // Enable Input
    document.getElementById('admin-chat-input').disabled = false;
    document.getElementById('admin-chat-send').disabled = false;
    
    // --- INJECT DELETE BUTTON ---
    const headerActions = document.getElementById('chat-header-actions');
    headerActions.innerHTML = ""; // Clear
    const deleteBtn = document.createElement('button');
    deleteBtn.className = "text-[9px] font-bold bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded hover:bg-danger hover:text-white transition-all uppercase";
    deleteBtn.innerHTML = "Clear";
    deleteBtn.onclick = deleteCurrentChat;
    headerActions.appendChild(deleteBtn);

    renderChatMessages(userId);
}

// --- UPDATED RENDERER FOR ADMIN CHAT (TEXT + IMAGES) ---
function renderChatMessages(userId) {
    const container = document.getElementById('chat-messages');
    
    // Safety check: ensure user data exists
    if (!activeChats[userId]) return;
    
    const messages = activeChats[userId].messages || [];

    // 1. Generate HTML for all messages
    container.innerHTML = messages.map(m => {
        const isAdmin = m.sender === 'admin';
        const align = isAdmin ? 'items-end' : 'items-start';
        
        // Admin gets Cyan background, User gets dark transparent glass look
        const bubble = isAdmin 
            ? 'bg-primary text-black rounded-tr-none' 
            : 'bg-white/10 text-white border border-white/10 rounded-tl-none';
        
        // --- LOGIC FOR IMAGE VS TEXT ---
        let contentHtml = "";
        if (m.type === 'image') {
            // Display image as a clickable thumbnail
            contentHtml = `
                <div class="relative group">
                    <img src="${m.text}" 
                         class="rounded-lg max-w-full max-h-64 object-cover cursor-zoom-in hover:scale-[1.02] transition-all border border-white/10 shadow-neon" 
                         onclick="window.open('${m.text}')"
                         alt="Uploaded Transmission">
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <span class="bg-black/60 px-2 py-1 rounded text-[8px] text-white font-mono">CLICK TO EXPAND</span>
                    </div>
                </div>`;
        } else {
            // Display regular text
            contentHtml = `<p class="whitespace-pre-wrap leading-relaxed">${m.text}</p>`;
        }

        return `
            <div class="flex flex-col ${align} mb-4 animate-fade-in">
                <div class="max-w-[85%] ${bubble} px-4 py-3 rounded-2xl text-xs font-medium shadow-2xl transition-all">
                    ${contentHtml}
                </div>
                <div class="flex items-center gap-2 mt-1 px-2">
                    <span class="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                        ${isAdmin ? 'MISSION CONTROL' : 'SIGNAL'}
                    </span>
                    <span class="text-[9px] text-slate-600 font-mono italic">
                        ${m.time}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    // 2. Smoothly scroll to the bottom so the newest message is always visible
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

// Send Message Logic
document.getElementById('admin-chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();
    
    if(!text || !currentChatID) return;
    
    // Add Message to Data
    const chatData = activeChats[currentChatID];
    chatData.messages.push({
        sender: 'admin',
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    chatData.unreadByUser = true; // Flag for user
    
    // Save
    activeChats[currentChatID] = chatData;
    localStorage.setItem(CHAT_KEY, JSON.stringify(activeChats));
    
    // UI Update
    input.value = "";
    renderChatMessages(currentChatID);
});

function updateSupportBadge() {
    const hasUnread = Object.values(activeChats).some(c => c.unreadByAdmin);
    const badge = document.getElementById('support-badge');
    if(hasUnread) {
        badge.classList.remove('hidden');
        // Optional: Play Sound
    } else {
        badge.classList.add('hidden');
    }
}


// --- 6. UTILS & MODALS ---

// Modal Logic
window.openCreateModal = function() {
    document.getElementById('manifest-form').reset();
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => {
        const panel = document.getElementById('modal-panel');
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
    }, 10);
    generateId();
}

window.closeModal = function() {
    const panel = document.getElementById('modal-panel');
    panel.classList.remove('scale-100', 'opacity-100');
    panel.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        document.getElementById('modal-overlay').classList.add('hidden');
    }, 300);
}

// Generate ID
window.generateId = function() {
    const id = "AH-" + Math.floor(Math.random() * 10000) + "X";
    document.getElementById('inp-id').value = id;
}

// Form Submit (Create/Edit)
document.getElementById('manifest-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newItem = {
        id: document.getElementById('inp-id').value,
        origin: document.getElementById('inp-origin').value,
        destination: document.getElementById('inp-dest').value,
        status: document.getElementById('inp-status').value,
        weight: document.getElementById('inp-weight').value,
        location: document.getElementById('inp-loc').value,
        // NEW FIELDS
        eta: document.getElementById('inp-eta').value,
        cargo: document.getElementById('inp-cargo').value,
        sender: document.getElementById('inp-sender').value,
        receiver: document.getElementById('inp-receiver').value
    };

    const data = getShipments();
    const idx = data.findIndex(x => x.id === newItem.id);
    if(idx >= 0) data[idx] = newItem;
    else data.unshift(newItem);

    saveDB(data);
    closeModal();
    showToast("Ledger Updated Successfully", "success");
    logActivity(`Manifest ${newItem.id} processed`);
});

// Edit / Delete
window.editItem = function(id, e) {
    e.stopPropagation();
    const item = getShipments().find(x => x.id === id);
    if(!item) return;
    openCreateModal();
    
    document.getElementById('inp-id').value = item.id;
    document.getElementById('inp-origin').value = item.origin;
    document.getElementById('inp-dest').value = item.destination;
    document.getElementById('inp-status').value = item.status;
    document.getElementById('inp-weight').value = item.weight;
    document.getElementById('inp-loc').value = item.location;
    
    // NEW FIELDS
    document.getElementById('inp-eta').value = item.eta || "";
    document.getElementById('inp-cargo').value = item.cargo || "";
    document.getElementById('inp-sender').value = item.sender || "";
    document.getElementById('inp-receiver').value = item.receiver || "";
}

window.deleteItem = function(id, e) {
    e.stopPropagation();
    if(confirm("Purge this manifest from the Neural Ledger?")) {
        const data = getShipments().filter(x => x.id !== id);
        saveDB(data);
        showToast("Manifest Purged", "danger");
        logActivity(`Manifest ${id} purged`);
    }
}

// Search
document.getElementById('search-input').addEventListener('input', renderShipments);

// Stats & Logs
function updateStats() {
    const data = getShipments();
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-transit').innerText = data.filter(x => x.status === "In Transit").length;
    document.getElementById('stat-visitors').innerText = activeVisitors.length;
}

function logActivity(msg) {
    const log = document.getElementById('activity-log');
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = "border-l-2 border-primary/20 pl-2 text-slate-400 fade-in-up";
    div.innerHTML = `<span class="text-primary">${time}</span> > ${msg}`;
    log.prepend(div);
}

function showToast(msg, type="info") {
    const container = document.getElementById('toast-container');
    const colors = { info: "border-primary text-white", success: "border-success text-success", danger: "border-danger text-danger" };
    const div = document.createElement('div');
    div.className = `glass-panel px-4 py-3 rounded-xl border-l-4 ${colors[type]} shadow-2xl fade-in-up flex items-center gap-3`;
    div.innerHTML = `<span class="material-symbols-rounded text-sm">notifications</span> <span class="font-bold text-xs uppercase">${msg}</span>`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

window.logout = function() {
    window.location.href = "index.html";
}

// --- DELETE CHAT LOGIC ---
function deleteCurrentChat() {
    if (!currentChatID) return;

    if (confirm(`Permanently delete conversation with ${currentChatID}?`)) {
        // 1. Delete from Memory
        delete activeChats[currentChatID];
        
        // 2. Delete from Storage
        localStorage.setItem(CHAT_KEY, JSON.stringify(activeChats));
        
        // 3. Reset UI
        currentChatID = null;
        renderChatList(); // Refresh list on left
        
        // Clear Main Window
        document.getElementById('chat-messages').innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <span class="material-symbols-rounded text-6xl mb-4">delete_forever</span>
                <p class="text-xs uppercase tracking-widest">Conversation Deleted</p>
            </div>
        `;
        document.getElementById('chat-active-user').innerText = "Select a Frequency";
        document.getElementById('chat-active-status').innerText = "WAITING...";
        document.getElementById('chat-active-status').className = "text-[10px] text-slate-500 font-mono";
        
        // Disable Inputs
        document.getElementById('admin-chat-input').disabled = true;
        document.getElementById('admin-chat-send').disabled = true;

        // Remove the Delete Button itself
        const btn = document.getElementById('btn-delete-chat');
        if (btn) btn.remove();

        showToast("Transmission Log Purged", "danger");
    }
}

// --- MOBILE UI UTILS ---
function closeChatMobile() {
    currentChatID = null;
    // Show the list again
    document.getElementById('chat-list-container').classList.remove('hidden');
    // Hide the chat window
    const win = document.getElementById('chat-window-container');
    win.classList.add('hidden');
    win.classList.remove('flex');
    
    renderChatList(); // Refresh list to update active states
}