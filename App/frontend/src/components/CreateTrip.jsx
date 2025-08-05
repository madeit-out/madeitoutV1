import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI, EventAPI } from "../adapters/apiAdapter";
import { format, parseISO, differenceInDays } from "date-fns";

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

  // New state to manage the initial date input
  const [datesEntered, setDatesEntered] = useState(false);
  const [manualDates, setManualDates] = useState({
    arrival: "",
    departure: "",
  });

  const chatContainerRef = useRef(null);

  // Removed questions for 'cover_image_url' and 'is_public'
  const questionsSequence = [
    {
      key: "title",
      prompt:
        "Hello! I'm Mio, your Trip Planning AI. What's the title of your next adventure?",
    },
    {
      key: "destination",
      prompt: "Great! Where are you heading for your trip?",
    },
    {
      key: "interests",
      prompt:
        "What kind of activities or interests do you have in mind for this trip? (e.g., 'hiking, museums, food tours')",
    },
    {
      key: "memberEmails",
      prompt:
        "Who else is joining you? Please provide their emails, comma-separated (e.g., user1@example.com, user2@example.com).",
    },
    {
      key: "budget",
      prompt:
        "What's the estimated budget for this trip? (optional, e.g., '1500')",
    },
    {
      key: "final_generation",
      prompt:
        "Okay, I have all the details! I'm generating a full itinerary for you now. This might take a moment...",
    },
  ];

  useEffect(() => {
    if (chatHistory.length === 0 && !isWaitingForAI && datesEntered) {
      askAIForNextQuestion(questionsSequence[0].prompt);
    }
  }, [datesEntered]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
    const apiKey = import.meta.env.GEMINI_API_KEY;
    const apiUrl = import.meta.env.GEMINI_API_URL;

    const payload = {
      contents: [...history, { role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to get AI response."
        );
      }

      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error(
          "Gemini API returned an unexpected response structure."
        );
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError(
        err.message || "Failed to communicate with AI. Please try again."
      );
      return null;
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const askAIForNextQuestion = (prompt) => {
    setChatHistory((prev) => [...prev, { role: "model", text: prompt }]);
  };

  const processUserResponse = async (e) => {
    e.preventDefault();
    if (
      isWaitingForAI ||
      (!currentInput.trim() &&
        currentQuestionIndex !== 4 &&
        currentQuestionIndex !== 5)
    ) {
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
      if (
        dateParts.length === 2 &&
        dateParts[0].match(/^\d{4}-\d{2}-\d{2}$/) &&
        dateParts[1].match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
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
          setChatHistory((prev) => [
            ...prev,
            { role: "model", text: nextQuestion.prompt },
          ]);
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

    const tripDuration =
      differenceInDays(parseISO(data.departure), parseISO(data.arrival)) + 1;

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
        const generatedItinerary = JSON.parse(
          generatedText.replace(/```json|```/g, "").trim()
        );
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
        setError(
          "I'm sorry, I couldn't generate a valid itinerary. Please try again."
        );
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
        // The rest of the payload fields (description, is_public, cover_image_url) are not
        // part of the refined AI flow, so they are not included here.
      };

      const newTrip = await TripAPI.createTrip(payload);

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

  const isReadyForSubmission = collectedTripData.aiGeneratedItinerary !== null;
  const isAIFlowStarted = datesEntered;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D] p-6 font-inter">
      <div className="w-full max-w-2xl bg-[#012A3D] p-8 rounded-2xl shadow-xl text-white flex flex-col h-[80vh]">
        <h2 className="text-3xl font-bold text-[#72ADBF] text-center mb-6">
          Plan Your Trip with AI
        </h2>

        {!isAIFlowStarted && (
          // Initial Manual Date Input Form
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartPlanning();
            }}
          >
            <p className="text-xl text-gray-300 text-center mb-6">
              To begin, please select your trip dates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="arrival"
                  className="block text-gray-300 text-sm font-semibold mb-2"
                >
                  Arrival Date
                </label>
                <input
                  type="date"
                  id="arrival"
                  name="arrival"
                  value={manualDates.arrival}
                  onChange={handleManualDateChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#01374A] text-white border border-[#72ADBF] focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="departure"
                  className="block text-gray-300 text-sm font-semibold mb-2"
                >
                  Departure Date
                </label>
                <input
                  type="date"
                  id="departure"
                  name="departure"
                  value={manualDates.departure}
                  onChange={handleManualDateChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#01374A] text-white border border-[#72ADBF] focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-center text-sm mt-4">{error}</p>
            )}
            <button
              type="submit"
              className="mt-6 w-full text-white text-lg font-semibold uppercase
                         py-3 px-6 rounded-lg border border-[#0395A7]
                         bg-[#0395A7] hover:bg-[#5E877D]
                         transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              Start Planning with Mio
            </button>
          </form>
        )}

        {isAIFlowStarted && (
          // AI Chat History Display
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 rounded-lg bg-[#01374A] mb-4 custom-scrollbar"
            >
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                      msg.role === "user"
                        ? "bg-[#0395A7] text-white"
                        : "bg-[#5E877D] text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isWaitingForAI && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-[#5E877D] text-white flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* User Input Area */}
            <form onSubmit={processUserResponse} className="flex mt-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-l-lg bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
                placeholder="Type your answer here..."
                disabled={isWaitingForAI || isReadyForSubmission}
              />
              <button
                type="submit"
                disabled={
                  isWaitingForAI || isReadyForSubmission || !currentInput.trim()
                }
                className="px-6 py-3 rounded-r-lg bg-[#0395A7] text-white hover:bg-[#5E877D] transition-colors duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-[#72ADBF] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        )}

        {error && (
          <p className="text-red-400 text-center text-sm mt-4">{error}</p>
        )}

        {isReadyForSubmission && (
          <div className="mt-6 p-4 bg-[#01374A] rounded-lg">
            <h3 className="text-xl font-bold text-[#72ADBF] mb-4">
              Review Your Trip Details:
            </h3>
            <p className="text-sm">
              <strong>Title:</strong> {collectedTripData.title}
            </p>
            <p className="text-sm">
              <strong>Destination:</strong> {collectedTripData.destination}
            </p>
            <p className="text-sm">
              <strong>Dates:</strong> {collectedTripData.arrival} to{" "}
              {collectedTripData.departure}
            </p>
            <p className="text-sm">
              <strong>Interests:</strong> {collectedTripData.interests || "N/A"}
            </p>
            <p className="text-sm mt-2">
              <strong>Members:</strong>{" "}
              {collectedTripData.memberEmails || "None"}
            </p>
            <p className="text-sm">
              <strong>Budget:</strong>{" "}
              {collectedTripData.budget
                ? `$${collectedTripData.budget}`
                : "N/A"}
            </p>

            <h4 className="text-lg font-bold text-[#72ADBF] mt-4 mb-2">
              Generated Itinerary:
            </h4>
            {collectedTripData.aiGeneratedItinerary.map((day, index) => (
              <div key={index} className="mb-4">
                <p className="text-md font-semibold text-white">
                  Day {index + 1}: {format(parseISO(day.date), "PPPP")}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-300">
                  {day.events.map((event, eventIndex) => (
                    <li key={eventIndex}>
                      <strong>{event.title}</strong> ({event.start_time} -{" "}
                      {event.end_time})
                      <br />
                      <em>Location: {event.location}</em>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <button
              onClick={handleFinalTripSubmission}
              disabled={isTripCreating || isWaitingForAI}
              className="mt-6 w-full text-white text-lg font-semibold uppercase
                         py-3 px-6 rounded-lg border border-[#0395A7]
                         bg-[#0395A7] hover:bg-[#5E877D]
                         transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-[#72ADBF]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTripCreating ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Trip...
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
