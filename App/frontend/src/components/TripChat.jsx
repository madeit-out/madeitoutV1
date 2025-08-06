import React, { useEffect, useState, useRef } from "react";
import { Send, Users, Wifi, WifiOff } from "lucide-react";
import { useUser } from "../context/UserContext"; // 1. Import useUser to get the real user
import { ChatSocket } from "../adapters/socketAdapters"; // 2. Import the REAL ChatSocket

const TripChat = ({ tripId }) => {
  const { user } = useUser(); // Get the logged-in user from context
  const userId = user ? user.id : null; // Get the user's ID

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!tripId || !userId) return;
  
    const onConnect = () => {
      console.log("✅ Socket connected! Joining room...");
      setConnected(true);
      setIsConnecting(false);
      ChatSocket.joinRoom(tripId);
    };
  
    const onDisconnect = () => {
      console.log("⚠️ Socket disconnected.");
      setConnected(false);
      setIsConnecting(false);
    };
  
    // ✅ Set up listeners FIRST
    ChatSocket.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  
    ChatSocket.onHistoricalMessages((history) => {
      setMessages(history);
    });
  
    // ✅ THEN connect and set up connection callbacks
    ChatSocket.setConnectionCallbacks(onConnect, onDisconnect);
    ChatSocket.connect();
  
    // Cleanup remains the same
    return () => {
      ChatSocket.offMessage();
      ChatSocket.offHistoricalMessages();
      ChatSocket.disconnect();
    };
  }, [tripId, userId]);// Re-run effect if tripId or userId changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !connected || !userId) {
      return;
    }
    ChatSocket.sendMessage(tripId, newMessage, userId);
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(135deg, #F5F5DC 0%, #F5F5DC 70%, rgba(224, 133, 68, 0.2) 100%)'
      }}
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/20"
        style={{
          background: 'rgba(224, 133, 68, 0.95)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Trip Chat
            </h2>
            <div className="flex items-center gap-2">
              {connected ? (
                <><Wifi className="w-3 h-3 text-green-200" /><span className="text-xs text-white/80 font-medium">Connected</span></>
              ) : isConnecting ? (
                <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span className="text-xs text-white/80 font-medium">Connecting...</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-red-200" /><span className="text-xs text-white/80 font-medium">Disconnected</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Users className="w-8 h-8" style={{ color: '#416B6B' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1F474A' }}>Start the Conversation</h3>
            <p className="text-sm font-medium" style={{ color: 'rgba(31, 71, 74, 0.7)' }}>Share updates, coordinate plans, and stay connected with your travel group.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.senderId === userId;
            return (
              <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
                <div
                  className={`max-w-xs md:max-w-sm px-4 py-3 shadow-lg transition-all duration-300 hover:shadow-xl ${isUser ? "text-white rounded-2xl rounded-br-md" : "bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md"}`}
                  style={isUser ? { background: 'linear-gradient(135deg, #416B6B 0%, #E08544 100%)' } : {}}
                >
                  <p className={`text-sm font-medium leading-relaxed ${isUser ? 'text-white' : ''}`} style={!isUser ? { color: '#1F474A' } : {}}>{msg.text}</p>
                  <div className={`text-xs mt-2 text-right ${isUser ? 'text-white/80' : ''}`} style={!isUser ? { color: 'rgba(31, 71, 74, 0.5)' } : {}}>{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/20" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), handleSend()) : null}
              placeholder={connected ? "Type your message..." : "Connecting..."}
              className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 font-medium transition-all duration-300"
              style={{ color: '#1F474A', borderColor: 'rgba(65, 107, 107, 0.2)', '--tw-placeholder-color': 'rgba(31, 71, 74, 0.4)' }}
              onFocus={(e) => { e.target.style.borderColor = '#E08544'; e.target.style.boxShadow = '0 0 0 4px rgba(224, 133, 68, 0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(65, 107, 107, 0.2)'; e.target.style.boxShadow = 'none'; }}
              disabled={!connected}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!connected || !newMessage.trim()}
            className="flex items-center justify-center w-14 h-14 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: connected && newMessage.trim() ? 'linear-gradient(135deg, #416B6B 0%, #E08544 100%)' : '#94a3b8', boxShadow: connected && newMessage.trim() ? '0 10px 25px rgba(224, 133, 68, 0.3)' : 'none' }}
            onFocus={(e) => { if (connected && newMessage.trim()) { e.target.style.boxShadow = '0 0 0 4px rgba(224, 133, 68, 0.3), 0 10px 25px rgba(224, 133, 68, 0.3)'; } }}
            onBlur={(e) => { if (connected && newMessage.trim()) { e.target.style.boxShadow = '0 10px 25px rgba(224, 133, 68, 0.3)'; } }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripChat;