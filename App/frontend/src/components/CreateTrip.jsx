import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI, EventAPI } from "../adapters/apiAdapter";
import { format, parseISO, differenceInDays } from "date-fns";
import { Calendar, Sparkles, Send, CheckCircle } from "lucide-react";

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

  const [datesEntered, setDatesEntered] = useState(false);
  const [manualDates, setManualDates] = useState({
    arrival: "",
    departure: "",
  });

  const chatContainerRef = useRef(null);

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

  // In src/components/CreateTrip.jsx

const callGeminiAPI = async (prompt, history = []) => {
  setIsWaitingForAI(true);
  setError("");
  
  const apiUrl = import.meta.env.VITE_GEMINI_API_URL;

  // --- FIX: Transform the chat history to match the API's expected format ---
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const payload = {
    // Use the newly formatted history along with the new prompt
    contents: [...formattedHistory, { role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to get a specific error message from the API response
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
      // Handle cases where the API returns a success status but no content
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
      
      // FIX: Destructure the response to get the nested 'trip' object.
      const { trip: newTrip } = await TripAPI.createTrip(payload);
  
      // Now 'newTrip' is the actual trip object and 'newTrip._id' will be defined.
      if (collectedTripData.aiGeneratedItinerary) {
        for (const day of collectedTripData.aiGeneratedItinerary) {
          for (const event of day.events) {
            const startTimeISO = `${day.date}T${event.start_time}:00.000Z`;
            const endTimeISO = `${day.date}T${event.end_time}:00.000Z`;
  
            await EventAPI.createEvent(newTrip._id, { // This will now have the correct ID
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6 font-['Inter']">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 sm:p-10 flex flex-col h-[85vh] transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#E08544] mr-3" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1F474A] leading-tight tracking-tight">
              Plan Your Trip
            </h1>
            <Sparkles className="w-8 h-8 text-[#E08544] ml-3" />
          </div>
          <p className="text-base sm:text-lg text-[#1F474A]/70 leading-relaxed font-medium">
            Let Mio, your AI travel assistant, create the perfect itinerary for your group adventure
          </p>
        </div>

        {!isAIFlowStarted && (
          /* Initial Date Selection */
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-[#416B6B] mr-2" />
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1F474A] tracking-tight">
                  Select Your Travel Dates
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      name="arrival"
                      value={manualDates.arrival}
                      onChange={handleManualDateChange}
                      className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      name="departure"
                      value={manualDates.departure}
                      onChange={handleManualDateChange}
                      className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStartPlanning}
                  className="w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide uppercase"
                >
                  Start Planning with Mio
                </button>
              </div>
            </div>
          </div>
        )}

        {isAIFlowStarted && (
          /* AI Chat Interface */
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-inner border border-white/20 mb-6"
            >
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl shadow-md font-medium transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#416B6B] to-[#416B6B]/80 text-white"
                        : "bg-gradient-to-r from-[#E08544] to-[#E08544]/80 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isWaitingForAI && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-4 rounded-2xl shadow-md bg-[#1F474A]/10 border border-[#416B6B]/20 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#416B6B]/20 border-t-[#E08544] mr-3"></div>
                    <span className="text-[#1F474A]/70 font-medium">Mio is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm"
                placeholder="Type your answer here..."
                disabled={isWaitingForAI || isReadyForSubmission}
              />
              <button
                type="button"
                onClick={processUserResponse}
                disabled={isWaitingForAI || isReadyForSubmission || !currentInput.trim()}
                className="px-6 py-4 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {isReadyForSubmission && (
          /* Trip Review & Creation */
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-[#416B6B] mr-2" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F474A] tracking-tight">
                Review Your Adventure
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Title:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">{collectedTripData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Destination:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">{collectedTripData.destination}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Dates:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">
                    {collectedTripData.arrival} to {collectedTripData.departure}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Interests:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">{collectedTripData.interests || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Members:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">{collectedTripData.memberEmails || "Just you"}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1F474A] tracking-wide">Budget:</span>
                  <p className="text-base text-[#1F474A]/70 font-medium">
                    {collectedTripData.budget ? `$${collectedTripData.budget}` : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-[#1F474A] mb-4">Generated Itinerary:</h4>
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {collectedTripData.aiGeneratedItinerary && collectedTripData.aiGeneratedItinerary.map((day, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <p className="text-base font-bold text-[#416B6B] mb-2">
                      Day {index + 1}: {format(parseISO(day.date), "PPPP")}
                    </p>
                    <div className="space-y-2">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="pl-4 border-l-2 border-[#E08544]/30">
                          <p className="text-sm font-semibold text-[#1F474A]">{event.title}</p>
                          <p className="text-xs text-[#1F474A]/60">
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
              className="w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none tracking-wide uppercase"
            >
              {isTripCreating ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                  Creating Your Adventure...
                </div>
              ) : (
                "Create Trip"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}