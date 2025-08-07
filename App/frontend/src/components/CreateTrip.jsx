import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI, EventAPI } from "../adapters/apiAdapter";
import { format, parseISO, differenceInDays } from "date-fns";
import { Calendar, Sparkles, Send, CheckCircle, MapPin, Users, DollarSign, Clock } from "lucide-react";

export default function CreateTrip({ onTripCreated }) {
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [collectedTripData, setCollectedTripData] = useState({
    title: "",
    destination: "",
    arrival: "",
    departure: "",
    interests: "",
    memberEmails: "",
    aiGeneratedItinerary: null,
    budget: null,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [isTripCreating, setIsTripCreating] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const [datesEntered, setDatesEntered] = useState(false);
  const [manualDates, setManualDates] = useState({
    arrival: "",
    departure: "",
  });

  const chatContainerRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const questionsSequence = [
    {
      key: "title",
      prompt: "Hello! I'm Mio, your Trip Planning AI. What's the title of your next adventure?",
    },
    {
      key: "destination",
      prompt: "Great! Where are you heading for your trip?",
    },
    {
      key: "interests",
      prompt: "What kind of activities or interests do you have in mind for this trip? (e.g., 'hiking, museums, food tours')",
    },
    {
      key: "memberEmails",
      prompt: "Who else is joining you? Please provide their emails, comma-separated (e.g., user1@example.com, user2@example.com).",
    },
    {
      key: "budget",
      prompt: "What's the estimated budget for this trip? (optional, e.g., '1500')",
    },
    {
      key: "final_generation",
      prompt: "Okay, I have all the details! I'm generating a full itinerary for you now. This might take a moment...",
    },
  ];

  useEffect(() => {
    if (chatHistory.length === 0 && !isWaitingForAI && datesEntered) {
      askAIForNextQuestion(questionsSequence[0].prompt);
    }
  }, [datesEntered]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleManualDateChange = (e) => {
    setManualDates((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStartPlanning = () => {
    if (!manualDates.arrival || !manualDates.departure) {
      setError("Please select both an arrival and departure date.");
      return;
    }
    setError("");
    setDatesEntered(true);
    setCollectedTripData((prev) => ({
      ...prev,
      arrival: manualDates.arrival,
      departure: manualDates.departure,
    }));
    askAIForNextQuestion(questionsSequence[0].prompt);
  };

  const callGeminiAPI = async (prompt, history = []) => {
    setIsWaitingForAI(true);
    setError("");
    
    const apiUrl = import.meta.env.VITE_GEMINI_API_URL;

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const payload = {
      contents: [...formattedHistory, { role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "The AI service returned an error." }}));
        throw new Error(errorData.error?.message || "Failed to get AI response.");
      }

      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content?.parts?.length > 0
      ) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Gemini API returned an unexpected response structure.");
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError(err.message || "Failed to communicate with AI. Please try again.");
      return null;
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const askAIForNextQuestion = (prompt) => {
    setChatHistory((prev) => [...prev, { role: "model", text: prompt }]);
  };

  const processUserResponse = async (e) => {
    if (e) e.preventDefault();
    if (isWaitingForAI || (!currentInput.trim() && currentQuestionIndex !== 4 && currentQuestionIndex !== 5)) {
      return;
    }
    setError("");

    const userResponse = currentInput.trim();
    setChatHistory((prev) => [...prev, { role: "user", text: userResponse }]);
    setCurrentInput("");

    const currentKey = questionsSequence[currentQuestionIndex].key;
    let newCollectedData = { ...collectedTripData };
    let shouldAdvance = true;

    if (currentKey === "dates") {
      const dateParts = userResponse.split(" to ");
      if (dateParts.length === 2 && dateParts[0].match(/^\d{4}-\d{2}-\d{2}$/) && dateParts[1].match(/^\d{4}-\d{2}-\d{2}$/)) {
        newCollectedData.arrival = dateParts[0];
        newCollectedData.departure = dateParts[1];
      } else {
        setError("Please use 'YYYY-MM-DD to YYYY-MM-DD' format.");
        askAIForNextQuestion(questionsSequence[currentQuestionIndex].prompt);
        shouldAdvance = false;
      }
    } else if (currentKey === "budget") {
      const budgetValue = parseFloat(userResponse);
      if (!isNaN(budgetValue)) {
        newCollectedData.budget = budgetValue;
      } else if (userResponse.toLowerCase() !== "skip" && userResponse !== "") {
        setError("Please enter a valid number for the budget or type 'skip'.");
        askAIForNextQuestion(questionsSequence[currentQuestionIndex].prompt);
        shouldAdvance = false;
      }
    } else if (currentKey === "final_generation") {
      shouldAdvance = false;
    } else {
      newCollectedData[currentKey] = userResponse;
    }

    if (shouldAdvance) {
      setCollectedTripData(newCollectedData);
      const nextQuestionIdx = currentQuestionIndex + 1;
      if (nextQuestionIdx < questionsSequence.length) {
        const nextQuestion = questionsSequence[nextQuestionIdx];
        if (nextQuestion.key === "final_generation") {
          setChatHistory((prev) => [...prev, { role: "model", text: nextQuestion.prompt }]);
          generateFinalItinerary(newCollectedData);
        } else {
          askAIForNextQuestion(nextQuestion.prompt);
        }
        setCurrentQuestionIndex(nextQuestionIdx);
      }
    }
  };

  const generateFinalItinerary = async (data) => {
    setIsWaitingForAI(true);

    const tripDuration = differenceInDays(parseISO(data.departure), parseISO(data.arrival)) + 1;

    const finalPrompt = `Based on the following trip details, generate a ${tripDuration}-day itinerary in structured JSON format suitable for a travel app.
    Trip Title: ${data.title}
    Destination: ${data.destination}
    Arrival: ${data.arrival}
    Departure: ${data.departure}
    Interests: ${data.interests || "None specified"}
    Budget: ${data.budget ? `$${data.budget}` : "Not specified"}
    
    The JSON should be an array of objects, where each object represents a day. Each day object must have a 'date' (YYYY-MM-DD) and an 'events' array. Each event object must have a 'title', 'location', 'start_time' (HH:MM), and 'end_time' (HH:MM). Ensure the start_time is always before the end_time for an event. For arrival and departure days, only include events that fall within the trip's date range. Ensure the final number of days in the itinerary matches the trip duration.
    
    Example JSON structure:
    [
      {
        "date": "2025-08-01",
        "events": [
          { "title": "Check into Hotel", "location": "Hotel Name", "start_time": "14:00", "end_time": "15:00" },
          { "title": "Explore Local Market", "location": "Market Square", "start_time": "16:00", "end_time": "18:00" }
        ]
      },
      // ... more days to match trip duration ...
    ]
    `;

    const generatedText = await callGeminiAPI(finalPrompt, chatHistory);
    if (generatedText) {
      try {
        const generatedItinerary = JSON.parse(generatedText.replace(/```json|```/g, "").trim());
        setCollectedTripData((prev) => ({
          ...prev,
          aiGeneratedItinerary: generatedItinerary,
        }));
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            text: "I've generated a full itinerary draft for your trip! You can now review the details before creating your trip.",
          },
        ]);
      } catch (e) {
        console.error("Failed to parse AI-generated JSON:", e);
        setError("I'm sorry, I couldn't generate a valid itinerary. Please try again.");
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            text: "I'm sorry, I couldn't generate a valid itinerary. Please try again.",
          },
        ]);
      }
    } else {
      setError("I couldn't generate an itinerary. Please try again.");
    }
    setIsWaitingForAI(false);
  };

  const handleFinalTripSubmission = async () => {
    setIsTripCreating(true);
    setError("");
  
    if (
      !collectedTripData.title ||
      !collectedTripData.destination ||
      !collectedTripData.arrival ||
      !collectedTripData.departure
    ) {
      setError(
        "Missing essential trip details. Please ensure all previous steps were completed."
      );
      setIsTripCreating(false);
      return;
    }
  
    try {
      const formattedEmails = collectedTripData.memberEmails
        ? collectedTripData.memberEmails.split(",").map((email) => email.trim())
        : [];
  
      const payload = {
        title: collectedTripData.title,
        destination: collectedTripData.destination,
        arrival: collectedTripData.arrival,
        departure: collectedTripData.departure,
        memberEmails: formattedEmails,
        budget: collectedTripData.budget,
      };
      
      const { trip: newTrip } = await TripAPI.createTrip(payload);
  
      if (collectedTripData.aiGeneratedItinerary) {
        for (const day of collectedTripData.aiGeneratedItinerary) {
          for (const event of day.events) {
            const startTimeISO = `${day.date}T${event.start_time}:00.000Z`;
            const endTimeISO = `${day.date}T${event.end_time}:00.000Z`;
  
            await EventAPI.createEvent(newTrip._id, {
              title: event.title,
              location: event.location,
              start_time: startTimeISO,
              end_time: endTimeISO,
            });
          }
        }
      }
  
      onTripCreated();
      navigate(`/trips/${newTrip._id}/itinerary`);
    } catch (err) {
      console.error("Trip creation failed:", err);
      setError(err.message || "Failed to create trip. Please try again.");
    } finally {
      setIsTripCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserResponse();
    }
  };

  const isReadyForSubmission = collectedTripData.aiGeneratedItinerary !== null;
  const isAIFlowStarted = datesEntered;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6 font-['Inter'] custom-scrollbar">
      <div className={`w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10 flex flex-col h-[90vh] transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-2 h-12 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-6"></div>
            <Sparkles className="w-10 h-10 text-[#E08544] mr-4" />
            <h1 className="text-5xl sm:text-6xl font-black text-black leading-tight tracking-tight">
              Plan Your Trip
            </h1>
            <Sparkles className="w-10 h-10 text-[#E08544] ml-4" />
            <div className="w-2 h-12 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full ml-6"></div>
          </div>
          <p className="text-xl text-black leading-relaxed font-semibold max-w-2xl mx-auto">
            Let Mio, your AI travel assistant, create the perfect itinerary for your group adventure
          </p>
        </div>

        {!isAIFlowStarted && (
          /* Enhanced Initial Date Selection */
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 transition-all duration-500 hover:shadow-3xl">
              <div className="flex items-center justify-center mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
                <Calendar className="w-8 h-8 text-[#416B6B] mr-3" />
                <h2 className="text-3xl font-black text-black tracking-tight">
                  Select Your Travel Dates
                </h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-sm font-bold text-black tracking-wide mb-3">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      name="arrival"
                      value={manualDates.arrival}
                      onChange={handleManualDateChange}
                      className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-bold text-black tracking-wide mb-3">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      name="departure"
                      value={manualDates.departure}
                      onChange={handleManualDateChange}
                      className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl">
                    <p className="text-red-700 text-base font-semibold">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStartPlanning}
                  className="group relative overflow-hidden w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide uppercase text-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Start Planning with Mio
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {isAIFlowStarted && (
          /* Enhanced AI Chat Interface */
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-inner border border-white/30 mb-8 custom-scrollbar"
            >
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-6 rounded-2xl shadow-lg font-semibold transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#416B6B] to-[#416B6B]/90 text-white"
                        : "bg-gradient-to-r from-[#E08544] to-[#E08544]/90 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isWaitingForAI && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-6 rounded-2xl shadow-lg bg-[#416B6B]/10 border border-[#416B6B]/20 flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#416B6B]/20 border-t-[#E08544] mr-4"></div>
                    <span className="text-black font-semibold">Mio is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Input Area */}
            <div className="flex gap-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm"
                placeholder="Type your answer here..."
                disabled={isWaitingForAI || isReadyForSubmission}
              />
              <button
                type="button"
                onClick={processUserResponse}
                disabled={isWaitingForAI || isReadyForSubmission || !currentInput.trim()}
                className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10">
                  <Send className="w-6 h-6" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              </button>
            </div>
          </>
        )}

        {isReadyForSubmission && (
          /* Enhanced Trip Review & Creation */
          <div className="mt-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-center mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
              <CheckCircle className="w-8 h-8 text-[#416B6B] mr-3" />
              <h3 className="text-3xl font-black text-black tracking-tight">
                Review Your Adventure
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-5 h-5 text-[#E08544] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Title:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">{collectedTripData.title}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-[#416B6B] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Destination:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">{collectedTripData.destination}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-[#E08544] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Dates:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">
                    {collectedTripData.arrival} to {collectedTripData.departure}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-5 h-5 text-[#416B6B] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Interests:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">{collectedTripData.interests || "N/A"}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-[#E08544] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Members:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">{collectedTripData.memberEmails || "Just you"}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-5 h-5 text-[#416B6B] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Budget:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">
                    {collectedTripData.budget ? `$${collectedTripData.budget.toLocaleString()}` : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-2xl font-black text-black mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-3"></div>
                Generated Itinerary:
              </h4>
              <div className="space-y-6 max-h-64 overflow-y-auto custom-scrollbar">
                {collectedTripData.aiGeneratedItinerary && collectedTripData.aiGeneratedItinerary.map((day, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                    <p className="text-lg font-black text-[#416B6B] mb-4 flex items-center">
                      <div className="w-1 h-4 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-3"></div>
                      Day {index + 1}: {format(parseISO(day.date), "PPPP")}
                    </p>
                    <div className="space-y-3">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="pl-6 border-l-2 border-[#E08544]/40 bg-white/40 rounded-xl p-4">
                          <p className="text-base font-bold text-black mb-1">{event.title}</p>
                          <p className="text-sm text-black/70 font-semibold">
                            {event.start_time} - {event.end_time} • {event.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinalTripSubmission}
              disabled={isTripCreating || isWaitingForAI}
              className="group relative overflow-hidden w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none tracking-wide uppercase text-lg"
            >
              {isTripCreating ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white mr-4"></div>
                  Creating Your Adventure...
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Create Trip
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}