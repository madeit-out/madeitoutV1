import React, { useState, useRef } from "react";
import { Send, Users, LogIn, LogOut, MessageSquare } from "lucide-react";

// 1. Import your actual Firebase services and hooks
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

// Sign-in component with real authentication
const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 max-w-sm w-full">
        <div className="w-16 h-16 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h2
          className="text-2xl font-bold mb-4 tracking-tight"
          style={{ color: "#1F474A" }}
        >
          Join the Conversation
        </h2>
        <p
          className="text-base font-medium mb-8 leading-relaxed"
          style={{ color: "rgba(31, 71, 74, 0.7)" }}
        >
          Sign in to chat with your travel group and coordinate your amazing
          trip.
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 flex items-center justify-center gap-3"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

// Sign-out component with real authentication
const SignOut = () => {
  return (
    auth.currentUser && (
      <button
        onClick={() => auth.signOut()}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    )
  );
};

const TripChat = ({ tripId }) => {
  // 2. Use the real Firebase auth state hook
  const [user] = useAuthState(auth);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background:
          "linear-gradient(135deg, #F5F5DC 0%, #F5F5DC 70%, rgba(224, 133, 68, 0.2) 100%)",
      }}
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/20"
        style={{
          background: "rgba(224, 133, 68, 0.95)",
          backdropFilter: "blur(12px)",
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80 font-medium">
                {user ? "Connected" : "Not signed in"}
              </span>
            </div>
          </div>
        </div>
        <SignOut />
      </div>

      {/* Chat Content */}
      <div className="flex-1">
        {user ? <ChatRoom tripId={tripId} /> : <SignIn />}
      </div>
    </div>
  );
};

const ChatRoom = ({ tripId }) => {
  const dummy = useRef();
  const [formValue, setFormValue] = useState("");

  // 3. Set up the real Firestore query
  const messagesRef = collection(firestore, `trips/${tripId}/messages`);
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(q, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !formValue.trim()) return;

    const { uid, photoURL } = auth.currentUser;

    // 4. Use the real addDoc function to send a message
    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-12rem)]">
        {messages && messages.length > 0 ? (
          messages.map((msg) => {
            // FIX: Add a guard to ensure msg and msg.id exist before rendering
            if (!msg || !msg.id) return null;
            return <ChatMessage key={msg.id} message={msg} />;
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MessageSquare className="w-8 h-8" style={{ color: "#416B6B" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1F474A" }}>
              Start the Conversation
            </h3>
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(31, 71, 74, 0.7)" }}
            >
              Be the first to share updates with your travel group!
            </p>
          </div>
        )}
        <span ref={dummy}></span>
      </main>

      {/* Message Input */}
      <div
        className="p-4 border-t border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <form onSubmit={sendMessage} className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 font-medium transition-all duration-300"
              style={{
                color: "#1F474A",
                borderColor: "rgba(65, 107, 107, 0.2)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!formValue.trim()}
            className="flex items-center justify-center w-12 h-12 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: formValue.trim()
                ? "linear-gradient(135deg, #416B6B 0%, #E08544 100%)"
                : "#94a3b8",
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

const ChatMessage = ({ message }) => {
  const { text, uid, photoURL, createdAt } = message;

  // 5. Check against the real auth.currentUser
  const isCurrentUser = auth.currentUser && uid === auth.currentUser.uid;

  return (
    <div
      className={`flex items-start gap-3 mb-4 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0">
        <img
          src={photoURL || "https://i.pravatar.cc/40"}
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-white/50 shadow-lg"
        />
      </div>
      <div
        className={`max-w-xs md:max-w-sm px-4 py-3 shadow-lg ${
          isCurrentUser
            ? "text-white rounded-2xl rounded-tr-md"
            : "bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl rounded-tl-md"
        }`}
        style={
          isCurrentUser
            ? {
                background: "linear-gradient(135deg, #416B6B 0%, #E08544 100%)",
              }
            : {}
        }
      >
        <p
          className={`text-sm font-medium leading-relaxed ${
            !isCurrentUser ? "" : "text-white"
          }`}
          style={!isCurrentUser ? { color: "#1F474A" } : {}}
        >
          {text}
        </p>
        <div
          className={`text-xs mt-1 ${
            isCurrentUser ? "text-right text-white/80" : "text-left"
          }`}
          style={!isCurrentUser ? { color: "rgba(31, 71, 74, 0.5)" } : {}}
        >
          {createdAt?.toDate &&
            createdAt.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
      </div>
    </div>
  );
};

export default TripChat;
