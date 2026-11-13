import React, { useState, useEffect, useRef } from 'react';

const CHAT_KEY = "allcargo_chats";

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get or create a unique user ID for this visitor
    let uid = localStorage.getItem('visitor_id');
    if (!uid) {
      uid = 'usr_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', uid);
    }
    setUserId(uid);
    loadChat(uid);

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => loadChat(uid), 2000);
    
    // Listen for custom event from Contact page or elsewhere
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openSupportChat', handleOpenChat);

    return () => {
      clearInterval(interval);
      window.removeEventListener('openSupportChat', handleOpenChat);
    };
  }, []);

  // Removed local storage event listener since we are polling the server
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      markAsRead();
    }
  }, [messages, isOpen]);

  const loadChat = async (uid) => {
    try {
      const res = await fetch('/api/chat');
      const allChats = await res.json();
      const userChat = allChats[uid] || { messages: [], unreadByUser: false, unreadByAdmin: false };
      setMessages(userChat.messages || []);
      
      if (!isOpen && userChat.unreadByUser) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Failed to load chat", err);
    }
  };

  const markAsRead = async () => {
    setHasUnread(false);
    if (!userId) return;
    try {
      const res = await fetch('/api/chat');
      const allChats = await res.json();
      if (allChats[userId] && allChats[userId].unreadByUser) {
        allChats[userId].unreadByUser = false;
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allChats)
        });
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !userId) return;

    try {
      const res = await fetch('/api/chat');
      const allChats = await res.json();
      const userChat = allChats[userId] || { messages: [], unreadByUser: false, unreadByAdmin: false };
      
      const newMsg = {
        sender: 'user',
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      userChat.messages.push(newMsg);
      userChat.unreadByAdmin = true;
      allChats[userId] = userChat;
      
      setMessages(userChat.messages);
      setInputText('');
      
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allChats)
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) markAsRead();
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={toggleChat}
          className="size-14 bg-primary hover:bg-primary-light text-white rounded-full shadow-[0_8px_30px_rgba(15,147,83,0.4)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 relative"
        >
          <span className="material-symbols-outlined text-2xl">
            {isOpen ? 'close' : 'chat'}
          </span>
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 size-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out] h-[500px] max-h-[70vh]">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center gap-3 text-white">
            <div className="size-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold">Allcargo Support</h4>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <span className="size-1.5 bg-green-300 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm my-auto">
                Send us a message and we'll reply as soon as possible!
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex flex-col max-w-[80%] ${m.sender === 'user' ? 'self-end' : 'self-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    m.sender === 'user' 
                      ? 'bg-primary text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                  <span className={`text-[10px] text-slate-400 mt-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.time}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors text-slate-700"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="size-10 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
