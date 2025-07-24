import React, { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { ChatSocket } from "../adapters/socketAdapters.js"; // Added .js extension

// TripChat component to handle all chat-related logic and UI
export default function TripChat({ tripId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false); // Track socket connection status
  const [chatError, setChatError] = useState(''); // State for chat-specific errors
  const messagesEndRef = useRef(null); // Ref for scrolling to latest message
  const chatContainerRef = useRef(null); // Ref for the scrollable message area

  // New state to track unread messages
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  // New state to track if the user is currently scrolled to the bottom
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Function to check if the user is at the bottom of the scrollable chat
  const checkIfAtBottom = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Allow a small tolerance (e.g., 1px) for being at the bottom
      const atBottom = scrollHeight - scrollTop <= clientHeight + 1;
      setIsAtBottom(atBottom);
      return atBottom;
    }
    return true; // Default to true if ref not available
  };

  // Handle scroll event on the message container
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // Effect for WebSocket connection and message handling
  useEffect(() => {
    if (!tripId || !userId) {
      console.log("TripChat: Waiting for tripId or userId to establish socket connection.");
      return;
    }

    ChatSocket.connect();
    setSocketConnected(true);

    const handleNewMessage = (msg) => {
      console.log('TripChat: Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, { ...msg, timestamp: new Date(msg.timestamp) }]);

      // If not at the bottom, mark as unread
      if (!checkIfAtBottom()) {
        setHasUnreadMessages(true);
      }
    };

    const handleHistoricalMessages = (msgs) => {
      console.log('TripChat: Received historical messages:', msgs);
      const parsedMsgs = msgs.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      setMessages(parsedMsgs);
      // After loading historical messages, scroll to bottom and clear unread
      setTimeout(() => { // Use setTimeout to ensure DOM updates first
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasUnreadMessages(false);
        setIsAtBottom(true);
      }, 0);
    };

    const handleStatusMessage = (msg) => {
      console.log('TripChat: Status:', msg.text);
      // You can decide if status messages should trigger unread indicator
    };

    const handleSocketError = (err) => {
      console.error('TripChat: WebSocket error:', err);
      setChatError(err.message || 'Chat connection error.');
      setSocketConnected(false); // Update connection status on error
    };

    ChatSocket.onMessage(handleNewMessage);
    ChatSocket.onHistoricalMessages(handleHistoricalMessages);
    ChatSocket.onStatusMessage(handleStatusMessage);
    ChatSocket.onError(handleSocketError);

    ChatSocket.joinRoom(tripId);

    return () => {
      console.log("TripChat: Cleaning up socket listeners and disconnecting.");
      ChatSocket.offMessage(handleNewMessage);
      ChatSocket.offHistoricalMessages(handleHistoricalMessages);
      ChatSocket.offStatusMessage(handleStatusMessage);
      ChatSocket.offError(handleSocketError);
      ChatSocket.disconnect();
    };
  }, [tripId, userId]);

  // Scroll to the latest message whenever messages change AND we are at the bottom
  // Or when the component first loads (after historical messages)
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnreadMessages(false); // Clear unread if we scroll to bottom
    }
  }, [messages, isAtBottom]); // Depend on messages and isAtBottom

  // Function to send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    console.log("TripChat Debug: Attempting to send message.");
    console.log(`TripChat Debug: newMessage: '${newMessage}'`);
    console.log(`TripChat Debug: socketConnected: ${socketConnected}`);
    console.log(`TripChat Debug: userId: '${userId}'`);

    if (newMessage.trim() && socketConnected && userId) {
      console.log("TripChat Debug: All conditions met. Calling ChatSocket.sendMessage.");
      ChatSocket.sendMessage(tripId, newMessage, userId);
      setNewMessage('');
      setChatError('');
      setHasUnreadMessages(false); // Clear unread when sending a message
      setIsAtBottom(true); // Assume user wants to be at bottom after sending
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Force scroll down
    } else {
      console.log("TripChat Debug: Conditions NOT met for sending message.");
      if (!newMessage.trim()) {
        setChatError('Message cannot be empty.');
        console.log("TripChat Debug: Message is empty.");
      } else if (!socketConnected) {
        setChatError('Chat is not connected. Please try again.');
      } else if (!userId) {
        setChatError('User not identified for chat.');
        console.log("TripChat Debug: User ID is missing.");
      }
    }
  };

  return (
    // Chat Section Container: Darker Ocean Blue background, rounded, shadow
    <div className="bg-[#012A3D] rounded-2xl shadow-xl p-6 border border-[#01374A] mt-10">
      <h2 className="text-2xl font-bold mb-4 text-[#72ADBF] flex items-center justify-center relative">
        Trip Chat
        {hasUnreadMessages && (
          // Red dot indicator for unread messages
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 animate-pulse"></span>
        )}
      </h2>
      
      {/* Message Display Area */}
      <div
        ref={chatContainerRef} // Attach ref to the scrollable container
        onScroll={handleScroll} // Add onScroll event listener
        className="h-80 overflow-y-auto border border-[#01374A] rounded-lg p-4 bg-[#01374A] flex flex-col space-y-3"
      >
        {chatError && (
          <p className="text-red-400 text-center mb-2">{chatError}</p>
        )}
        {!socketConnected && !chatError && (
          <p className="text-gray-400 text-center mt-auto mb-auto">Connecting to chat...</p>
        )}
        {messages.length === 0 && socketConnected && !chatError ? (
          <p className="text-gray-400 text-center mt-auto mb-auto">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[70%] ${
                msg.senderId === userId
                  ? 'bg-[#0395A7] text-white shadow-md' // Your messages
                  : 'bg-gray-700 text-gray-200 shadow-sm' // Other users' messages
              }`}>
                <span className="block text-xs font-semibold mb-1 text-gray-100">
                  {msg.senderId === userId ? 'You' : `User: ${msg.senderId.substring(0, 8)}...`}
                </span>
                <p className="text-sm break-words">{msg.text}</p>
                <span className="block text-right text-xs text-gray-400 mt-1">
                  {msg.timestamp instanceof Date ? format(msg.timestamp, 'p') : 'Invalid Time'}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Scroll to this element */}
      </div>

      {/* Message Input Form */}
      <form onSubmit={sendMessage} className="flex mt-4 space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
          disabled={!socketConnected || !userId}
        />
        <button
          type="submit"
          className="text-white text-md font-semibold uppercase
                     py-3 px-6 rounded-lg border border-[#0395A7]
                     bg-[#0395A7] hover:bg-[#5E877D]
                     transition-all duration-300 ease-in-out
                     shadow-md hover:shadow-lg transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-[#72ADBF]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!socketConnected || !newMessage.trim() || !userId}
        >
          Send
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">Your User ID: {userId}</p>
    </div>
  );
}
