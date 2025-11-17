import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Send, Users, LogIn, LogOut, MessageSquare, X } from "lucide-react";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";



const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 max-w-md w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-black mb-6 tracking-tight">
          Join the Conversation
        </h2>
        <p className="text-lg text-black font-semibold mb-10 leading-relaxed">
          Sign in to chat with your travel group and coordinate your amazing
          trip.
        </p>
        <button
          onClick={signInWithGoogle}
          className="group relative overflow-hidden w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 flex items-center justify-center gap-3 text-lg"
        >
          <span className="relative z-10 flex items-center">
            <LogIn className="w-6 h-6 mr-2" />
            Sign in with Google
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <button
        onClick={() => auth.signOut()}
        className="group relative overflow-hidden flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-2xl transition-all duration-300 backdrop-blur-md transform hover:scale-105"
      >
        <span className="relative z-10 flex items-center">
          <LogOut className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      </button>
    )
  );
};

const ChatMessage = ({ message }) => {
  const { text, uid, photoURL, createdAt } = message;
  const isCurrentUser = auth.currentUser && uid === auth.currentUser.uid;

  if (!text) return null;

  return (
    <div className={`flex items-start gap-4 mb-6 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0">
        <img
          src={photoURL || "https://api.pravatar.cc/32"}
          alt="User avatar"
          className="w-12 h-12 rounded-full border-2 border-white/50 shadow-xl"
          onError={(e) => { e.target.src = "https://api.pravatar.cc/32"; }}
        />
      </div>
      <div
        className={`max-w-xs md:max-w-md px-6 py-4 shadow-2xl ${isCurrentUser ? "text-white rounded-3xl rounded-tr-md" : "bg-white/95 backdrop-blur-md border border-white/30 rounded-3xl rounded-tl-md"}`}
        style={isCurrentUser ? { background: "linear-gradient(135deg, #416B6B 0%, #E08544 100%)" } : {}}
      >
        <p className={`text-base font-semibold leading-relaxed ${!isCurrentUser ? "text-black" : "text-white"}`}>
          {text}
        </p>
        <div className={`text-sm mt-2 ${isCurrentUser ? "text-right text-white/80" : "text-left text-black/50"}`}>
          {createdAt?.toDate ? createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Sending..."}
        </div>
      </div>
    </div>
  );
};


const ChatRoom = ({ tripId }) => {
  const messagesEndRef = useRef();
  // The idField is not working as expected, so we'll handle the key differently.
  const messagesRef = collection(firestore, `trips/${tripId}/messages`);
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages, loading, error] = useCollectionData(q); // Removed idField option

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">Error: {error.message}</div>}
      {loading && <div className="text-center p-4 text-gray-500">Loading messages...</div>}
      
      {messages && messages.length > 0 ? (
        // --- FIX IS HERE ---
        // We check for 'msg' but not 'msg.id', and use the timestamp for the key.
        messages.map((msg, index) => 
          msg && <ChatMessage key={msg.createdAt?.toMillis() || index} message={msg} />
        )
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare className="w-10 h-10" style={{ color: "#416B6B" }} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-black">Start the Conversation</h3>
            <p className="text-lg font-semibold text-black/70">Be the first to share updates!</p>
          </div>
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const TripChatModal = ({ isOpen, onClose, tripId }) => {
  const [user] = useAuthState(auth);
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !formValue.trim() || !tripId) return;

    const { uid, photoURL } = auth.currentUser;
    const messagesRef = collection(firestore, `trips/${tripId}/messages`);

    try {
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
      setFormValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-[#F5F5DC] to-[#F5F5DC]/90 backdrop-blur-md rounded-3xl w-full max-w-4xl h-[80vh] shadow-2xl border border-white/30 flex flex-col">
          <div
            className="flex items-center justify-between p-6 border-b border-white/30 flex-shrink-0 rounded-t-3xl"
            style={{ background: "rgba(224, 133, 68, 0.95)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-2xl font-black text-white tracking-tight">Trip Chat</Dialog.Title>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-white/90 font-semibold">{user ? "Connected" : "Not signed in"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SignOut />
              <button onClick={onClose} className="group relative overflow-hidden p-2 rounded-xl hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 hover:scale-105">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {user ? (
            <>
              <ChatRoom tripId={tripId} />
              <div className="p-6 border-t border-white/30 flex-shrink-0 bg-white/90 backdrop-blur-md">
                <form onSubmit={sendMessage} className="flex gap-4 items-end">
                  <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-6 py-5 bg-white/90 backdrop-blur-md border-2 rounded-2xl focus:outline-none focus:ring-4 font-semibold transition-all duration-300 text-black placeholder-black/40 border-[rgba(65,107,107,0.2)] focus:ring-[rgba(224,133,68,0.3)]"
                  />
                  <button
                    type="submit"
                    disabled={!formValue.trim()}
                    className="group relative overflow-hidden flex items-center justify-center w-14 h-14 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-[#416B6B] to-[#E08544] disabled:from-slate-400 disabled:to-slate-500"
                  >
                    <span className="relative z-10"><Send className="w-6 h-6" /></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0"><SignIn /></div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TripChatModal;