import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI, EventAPI } from "../adapters/apiAdapter";
import { format, parseISO, differenceInDays } from "date-fns";
import { Calendar, Sparkles, Send, CheckCircle, MapPin, Users, DollarSign, Clock, Bot, Edit3, ArrowRight, Plus } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function CreateTrip() {
  const navigate = useNavigate();
  const { refreshTrips } = useUser();

  // AI Chat states
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [collectedTripData, setCollectedTripData] = useState({
    title: "",
    destination: "",
    arrival: "",
    departure: "",
    interests: "",
    memberUsernames: "", // CHANGED from memberEmails
    aiGeneratedItinerary: null,
    budget: null,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  // Manual form states
  const [manualFormData, setManualFormData] = useState({
    title: "",
    destination: "",
    interests: "",
    memberUsernames: "", // CHANGED from memberEmails
    budget: ""
  });
  const [manualErrors, setManualErrors] = useState({});
  const [manualCurrentStep, setManualCurrentStep] = useState(0);

  // Common states
  const [isTripCreating, setIsTripCreating] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [datesEntered, setDatesEntered] = useState(false);
  const [manualDates, setManualDates] = useState({
    arrival: "",
    departure: "",
  });
  const [creationMethod, setCreationMethod] = useState(null); // 'ai' or 'manual'

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
      key: "memberUsernames", // CHANGED key
      prompt: "Who else is joining you? Please provide their usernames, comma-separated (e.g., user1, user2).", // CHANGED prompt
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

  const manualSteps = [
    {
      title: "Trip Basics",
      description: "Give your trip a name and destination",
      fields: ["title", "destination"]
    },
    {
      title: "Additional Details",
      description: "Add interests, members, and budget",
      fields: ["interests", "memberUsernames", "budget"] // CHANGED field name
    }
  ];

  useEffect(() => {
    if (chatHistory.length === 0 && !isWaitingForAI && datesEntered && creationMethod === 'ai') {
      askAIForNextQuestion(questionsSequence[0].prompt);
    }
  }, [datesEntered, creationMethod]);

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
    if (new Date(manualDates.departure) <= new Date(manualDates.arrival)) {
      setError("Departure date must be after arrival date.");
      return;
    }
    setError("");
    setDatesEntered(true);
    setCollectedTripData((prev) => ({
      ...prev,
      arrival: manualDates.arrival,
      departure: manualDates.departure,
    }));
    // Set manual form dates as well
    setManualFormData(prev => ({
      ...prev,
      arrival: manualDates.arrival,
      departure: manualDates.departure,
    }));
  };

  const selectCreationMethod = (method) => {
    setCreationMethod(method);
    if (method === 'ai') {
      askAIForNextQuestion(questionsSequence[0].prompt);
    }
  };

  // AI-related functions (unchanged from original)
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

    if (currentKey === "budget") {
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
      }
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

  // Manual form functions
  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (manualErrors[name]) {
      setManualErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateManualStep = (stepIndex) => {
    const stepErrors = {};
    const currentStepFields = manualSteps[stepIndex].fields;

    currentStepFields.forEach(field => {
      if (field === "title" && !manualFormData.title.trim()) {
        stepErrors.title = "Trip title is required";
      }
      if (field === "destination" && !manualFormData.destination.trim()) {
        stepErrors.destination = "Destination is required";
      }
      if (field === "memberUsernames" && manualFormData.memberUsernames) { // CHANGED from memberEmails
        const usernames = manualFormData.memberUsernames.split(",").map(username => username.trim()); // CHANGED variable name
        const invalidUsernames = usernames.filter(username => !username); // CHANGED validation check
        if (invalidUsernames.length > 0) {
          stepErrors.memberUsernames = "Please ensure all usernames are valid and not empty."; // CHANGED error message
        }
      }
      if (field === "budget" && manualFormData.budget && isNaN(parseFloat(manualFormData.budget))) {
        stepErrors.budget = "Please enter a valid number";
      }
    });

    setManualErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleManualNext = () => {
    if (validateManualStep(manualCurrentStep)) {
      setManualCurrentStep(prev => Math.min(prev + 1, manualSteps.length - 1));
    }
  };

  const handleManualPrevious = () => {
    setManualCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleFinalTripSubmission = async (isManual = false) => {
    setIsTripCreating(true);
    setError("");
  
    let tripData;
    if (isManual) {
      if (!validateManualStep(manualCurrentStep)) {
        setIsTripCreating(false);
        return;
      }
      
      tripData = {
        title: manualFormData.title.trim(),
        destination: manualFormData.destination.trim(),
        arrival: manualDates.arrival,
        departure: manualDates.departure,
        memberUsernames: manualFormData.memberUsernames // CHANGED from memberEmails
          ? manualFormData.memberUsernames.split(",").map(username => username.trim()).filter(username => username) // CHANGED split logic
          : [],
        budget: manualFormData.budget ? parseFloat(manualFormData.budget) : null,
      };
    } else {
      // AI trip data
      if (
        !collectedTripData.title ||
        !collectedTripData.destination ||
        !collectedTripData.arrival ||
        !collectedTripData.departure
      ) {
        setError("Missing essential trip details. Please ensure all previous steps were completed.");
        setIsTripCreating(false);
        return;
      }
      
      tripData = {
        title: collectedTripData.title,
        destination: collectedTripData.destination,
        arrival: collectedTripData.arrival,
        departure: collectedTripData.departure,
        memberUsernames: collectedTripData.memberUsernames // CHANGED from memberEmails
          ? collectedTripData.memberUsernames.split(",").map((username) => username.trim()) // CHANGED split logic
          : [],
        budget: collectedTripData.budget,
      };
    }

    try {
      const { trip: newTrip } = await TripAPI.createTrip(tripData);

      // Only create AI-generated events for AI trips
      if (!isManual && collectedTripData.aiGeneratedItinerary) {
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
      
      await refreshTrips(); 
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

  const isAIReadyForSubmission = collectedTripData.aiGeneratedItinerary !== null;
  const isManualReadyForSubmission = manualCurrentStep === manualSteps.length - 1;

  const renderManualStepContent = () => {
    switch (manualCurrentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                name="title"
                value={manualFormData.title}
                onChange={handleManualInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white ${
                  manualErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Summer Adventure in Paris"
              />
              {manualErrors.title && <p className="text-red-500 text-sm mt-1">{manualErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="destination"
                  value={manualFormData.destination}
                  onChange={handleManualInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white ${
                    manualErrors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Paris, France"
                />
              </div>
              {manualErrors.destination && <p className="text-red-500 text-sm mt-1">{manualErrors.destination}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interests & Activities
              </label>
              <textarea
                name="interests"
                value={manualFormData.interests}
                onChange={handleManualInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-gray-900 bg-white"
                rows="3"
                placeholder="e.g., museums, hiking, food tours, nightlife..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trip Members
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="memberUsernames" // CHANGED name
                  value={manualFormData.memberUsernames} // CHANGED value
                  onChange={handleManualInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white ${
                    manualErrors.memberUsernames ? 'border-red-500' : 'border-gray-300' // CHANGED error key
                  }`}
                  placeholder="username1, username2, username3" // CHANGED placeholder
                />
              </div>
              {manualErrors.memberUsernames && <p className="text-red-500 text-sm mt-1">{manualErrors.memberUsernames}</p>} {/* CHANGED error key */}
              <p className="text-gray-500 text-sm mt-1">Separate multiple usernames with commas</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="budget"
                  value={manualFormData.budget}
                  onChange={handleManualInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white ${
                    manualErrors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1500"
                />
              </div>
              {manualErrors.budget && <p className="text-red-500 text-sm mt-1">{manualErrors.budget}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            Create your perfect trip with AI assistance or manual planning
          </p>
        </div>

        {!datesEntered && (
          /* Initial Date Selection */
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

                {manualDates.arrival && manualDates.departure && new Date(manualDates.departure) > new Date(manualDates.arrival) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <p className="text-blue-800 font-semibold">
                      Trip duration: {Math.ceil((new Date(manualDates.departure) - new Date(manualDates.arrival)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}

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
                    <ArrowRight className="w-6 h-6 mr-3" />
                    Continue to Trip Planning
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {datesEntered && !creationMethod && (
          /* Method Selection */
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-black mb-4">Choose Your Planning Method</h2>
              <p className="text-lg text-black/80 font-semibold">How would you like to create your trip?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* AI Option */}
              <div 
                onClick={() => selectCreationMethod('ai')}
                className="group cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:bg-gradient-to-br from-[#E08544]/10 to-[#416B6B]/10"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E08544] to-[#416B6B] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4">AI-Powered Planning</h3>
                  <p className="text-black/70 font-medium mb-6 leading-relaxed">
                    Let Mio, your AI assistant, create a personalized itinerary based on your preferences and interests.
                  </p>
                  <div className="space-y-2 text-sm text-black/60 font-medium">
                    <p>✨ Personalized recommendations</p>
                    <p>🗓️ Complete day-by-day itinerary</p>
                    <p>🎯 Based on your interests</p>
                  </div>
                </div>
              </div>

              {/* Manual Option */}
              <div 
                onClick={() => selectCreationMethod('manual')}
                className="group cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:bg-gradient-to-br from-[#416B6B]/10 to-[#E08544]/10"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Edit3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4">Manual Planning</h3>
                  <p className="text-black/70 font-medium mb-6 leading-relaxed">
                    Create your trip manually with full control over every detail. Add your own events later.
                  </p>
                  <div className="space-y-2 text-sm text-black/60 font-medium">
                    <p>⚡ Quick setup</p>
                    <p>🎯 Full control</p>
                    <p>📝 Add events later</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {datesEntered && creationMethod === 'ai' && (
          /* AI Chat Interface */
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

            {/* Input Area */}
            <div className="flex gap-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm"
                placeholder="Type your answer here..."
                disabled={isWaitingForAI || isAIReadyForSubmission}
              />
              <button
                type="button"
                onClick={processUserResponse}
                disabled={isWaitingForAI || isAIReadyForSubmission || !currentInput.trim()}
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

        {datesEntered && creationMethod === 'manual' && (
          /* Manual Form Interface */
          <div className="flex-1 flex flex-col">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {manualSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      index <= manualCurrentStep 
                        ? 'bg-[#416B6B] text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index < manualCurrentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < manualSteps.length - 1 && (
                      <div className={`w-12 h-1 mx-2 transition-all ${
                        index < manualCurrentStep ? 'bg-[#416B6B]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black">{manualSteps[manualCurrentStep].title}</h2>
                <p className="text-black/70 text-sm font-medium">{manualSteps[manualCurrentStep].description}</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-inner border border-white/30 p-8">
              {renderManualStepContent()}

              {/* Error Messages */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (manualCurrentStep === 0) {
                      setCreationMethod(null);
                    } else {
                      handleManualPrevious();
                    }
                  }}
                  className="px-6 py-3 border-2 border-[#416B6B]/30 text-[#416B6B] rounded-xl font-semibold hover:bg-[#416B6B]/10 transition-colors"
                >
                  {manualCurrentStep === 0 ? 'Back to Options' : 'Previous'}
                </button>
                
                {manualCurrentStep < manualSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleManualNext}
                    className="px-8 py-3 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFinalTripSubmission(true)}
                    disabled={isTripCreating}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isTripCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Trip
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Trip Summary Preview */}
            {isManualReadyForSubmission && (manualFormData.title || manualFormData.destination) && (
              <div className="mt-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#416B6B] mr-2" />
                  Trip Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {manualFormData.title && (
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <span className="text-black/60 font-medium">Title:</span>
                      <p className="font-semibold text-black">{manualFormData.title}</p>
                    </div>
                  )}
                  {manualFormData.destination && (
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <span className="text-black/60 font-medium">Destination:</span>
                      <p className="font-semibold text-black">{manualFormData.destination}</p>
                    </div>
                  )}
                  <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                    <span className="text-black/60 font-medium">Dates:</span>
                    <p className="font-semibold text-black">{manualDates.arrival} to {manualDates.departure}</p>
                  </div>
                  {manualFormData.memberUsernames && ( // CHANGED conditional
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <span className="text-black/60 font-medium">Members:</span>
                      <p className="font-semibold text-black">{manualFormData.memberUsernames}</p> // CHANGED displayed data
                    </div>
                  )}
                  {manualFormData.budget && (
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <span className="text-black/60 font-medium">Budget:</span>
                      <p className="font-semibold text-black">${parseFloat(manualFormData.budget).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isAIReadyForSubmission && (
          /* AI Trip Review & Creation */
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
                    <Users className="w-5 h-5 text-[#E0854B] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Members:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">{collectedTripData.memberUsernames || "Just you"}</p> {/* CHANGED displayed data */}
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-5 h-5 text-[#416B6B] mr-2" />
                    <span className="text-sm font-bold text-black tracking-wide">Budget:</span>
                  </div>
                  <p className="text-lg text-black font-semibold">
                    {collectedTripData.budget ? `${collectedTripData.budget.toLocaleString()}` : "Not specified"}
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
              onClick={() => handleFinalTripSubmission(false)}
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