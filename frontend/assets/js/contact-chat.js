/**
 * USER SIDE LIVE CHAT LOGIC
 * Connects to the Admin Dashboard via LocalStorage
 */

const CHAT_KEY = "allcargo_chats";
// Generate or retrieve a persistent Guest ID for this browser
const userID = localStorage.getItem("ah_chat_id") || `Guest-${Math.floor(Math.random() * 9000) + 1000}`;
localStorage.setItem("ah_chat_id", userID);

let currentMessages = [];

// --- 1. TOGGLE WIDGET ---
window.toggleChatWidget = function() {
    const widget = document.getElementById('live-chat-widget');
    if (widget.classList.contains('hidden')) {
        widget.classList.remove('hidden');
        // Small delay for animation
        setTimeout(() => {
            widget.classList.remove('scale-95', 'opacity-0');
            widget.classList.add('scale-100', 'opacity-100');
        }, 10);
        document.getElementById('user-chat-input').focus();
        syncMessages(); // Check for messages immediately
    } else {
        widget.classList.remove('scale-100', 'opacity-100');
        widget.classList.add('scale-95', 'opacity-0');
        setTimeout(() => widget.classList.add('hidden'), 300);
    }
}

// --- 2. SEND MESSAGE ---
document.getElementById('user-chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('user-chat-input');
    const text = input.value.trim();
    if (!text) return;

    // A. Get Database
    const allChats = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    
    // B. Get or Create User Thread
    const myChat = allChats[userID] || { messages: [], unreadByAdmin: false, unreadByUser: false };
    
    // C. Add Message
    myChat.messages.push({
        sender: 'user',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    // D. Flag for Admin (Triggers the Sound on Dashboard)
    myChat.unreadByAdmin = true; 

    // E. Save
    allChats[userID] = myChat;
    localStorage.setItem(CHAT_KEY, JSON.stringify(allChats));

    // F. UI Update
    input.value = "";
    syncMessages();
});

// --- 3. SYNC & RENDER (The "Heartbeat") ---
function syncMessages() {
    const allChats = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    const myChat = allChats[userID];

    if (myChat) {
        // Only render if there are new messages
        if (JSON.stringify(myChat.messages) !== JSON.stringify(currentMessages)) {
            currentMessages = myChat.messages;
            renderChat(myChat.messages);
        }
    }
}

function renderChat(messages) {
    const container = document.getElementById('user-chat-messages');
    
    container.innerHTML = `
        <div class="self-start max-w-[85%] bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300">
             <span class="text-primary font-bold block mb-1 text-[9px] uppercase">System AI</span>
             Uplink established. An operator will join this frequency shortly. State your inquiry.
        </div>
    `;

    messages.forEach(m => {
        const isUser = m.sender === 'user';
        const align = isUser ? 'self-end' : 'self-start';
        const style = isUser 
            ? 'bg-primary text-black rounded-tr-none' 
            : 'bg-white/10 text-white border border-white/10 rounded-tl-none';
        
        // --- IMPROVED IMAGE DETECTION ---
        let contentHtml = "";
        
        // If the message is explicitly marked as image OR looks like base64 image data
        if (m.type === 'image' || (m.text && m.text.startsWith('data:image'))) {
            contentHtml = `
                <div class="relative group">
                    <img src="${m.text}" 
                         class="rounded-lg max-w-full h-auto cursor-zoom-in border border-black/10 shadow-lg" 
                         onclick="window.open('${m.text}')">
                </div>`;
        } else {
            contentHtml = `<p class="whitespace-pre-wrap">${m.text}</p>`;
        }

        const bubbleHtml = `
            <div class="${align} max-w-[80%] ${style} px-3 py-2 rounded-2xl text-xs font-medium shadow-lg animate-fade-in mb-2">
                ${contentHtml}
                <span class="block text-[8px] opacity-50 mt-1 ${isUser ? 'text-black' : 'text-slate-400'} text-right">
                    ${m.time}
                </span>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', bubbleHtml);
    });

    container.scrollTop = container.scrollHeight;
}

// Poll for replies every 1 second
setInterval(syncMessages, 1000);

window.handleImageUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    // Limit file size to 1MB for localStorage safety
    if (file.size > 1024 * 1024) {
        alert("File too large. Maximum size is 1MB for orbital uplink.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        sendChatMessage(base64Image, 'image');
    };
    reader.readAsDataURL(file);
    input.value = ""; // Reset input
};

// Update your existing send logic to a reusable function
// --- CORRECTED SEND FUNCTION ---
function sendChatMessage(content, type = 'text') {
    const allChats = JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    const myChat = allChats[userID] || { messages: [], unreadByAdmin: false };
    
    myChat.messages.push({
        sender: 'user',
        type: type, // This tells the computer it's an 'image' or 'text'
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    myChat.unreadByAdmin = true; 
    allChats[userID] = myChat;
    localStorage.setItem(CHAT_KEY, JSON.stringify(allChats));
    syncMessages();
}