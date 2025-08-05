import React, { useEffect, useState, useRef } from "react";
import { ChatSocket } from "../adapters/socketAdapters";

const TripChat = ({ tripId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // This function will be called ONLY when the socket connection is established.
    const onConnect = () => {
      console.log("Socket connected! Joining room...");
      setConnected(true);
      ChatSocket.joinRoom(tripId);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    // 1. Set the callbacks that will execute on connect and disconnect
    ChatSocket.setConnectionCallbacks(onConnect, onDisconnect);

    // 2. Now, initiate the connection. The 'onConnect' function above will be triggered upon success.
    ChatSocket.connect();

    // Set up listeners for incoming messages
    ChatSocket.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    ChatSocket.onHistoricalMessages((history) => {
      setMessages(history);
    });

    // Cleanup function on component unmount
    return () => {
      ChatSocket.offMessage();
      ChatSocket.offHistoricalMessages();
      ChatSocket.disconnect();
    };
  }, [tripId]); // Re-run this effect if the tripId changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    // FIX: Add this log to debug the send action.
    console.log(`handleSend triggered. Connection status: ${connected}`);

    if (!newMessage.trim() || !connected) {
      console.warn("Guard clause failed. Message not sent.");
      return;
    }
    ChatSocket.sendMessage(tripId, newMessage, userId);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 px-1">
        {messages.map((msg, index) => {
          const isUser = msg.senderId === userId;
          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl text-sm shadow ${
                  isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <div className="text-[10px] text-right mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={connected ? "Type a message..." : "Connecting..."}
          className="flex-1 border rounded-full px-4 py-2 shadow-sm focus:outline-none"
          disabled={!connected}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full disabled:bg-gray-400"
          disabled={!connected}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TripChat;
