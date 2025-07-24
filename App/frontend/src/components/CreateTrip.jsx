// src/pages/CreateTrip.jsx
import React, { useState } from "react";
import { TripAPI } from "../adapters/apiAdapter";

const CreateTrip = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    arrival: "",
    departure: "",
    memberUsernames: "", // comma-separated usernames
  });
  const [message, setMessage] = useState("");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const formattedUsernames = formData.memberUsernames
        ? formData.memberUsernames.split(",").map((name) => name.trim())
        : [];

      const payload = {
        title: formData.title,
        arrival: formData.arrival,
        departure: formData.departure,
        memberUsernames: formattedUsernames,
      };

      await TripAPI.createTrip(payload);
      console.log("Trip created successfully:", payload);
      setMessage("Trip created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create trip.");
    }
  };

  const questions = [
    {
      label: "What’s the name of your trip?",
      name: "title",
      type: "text",
    },
    {
      label: "When does the trip start?",
      name: "arrival",
      type: "date",
    },
    {
      label: "When does the trip end?",
      name: "departure",
      type: "date",
    },
    {
      label: "Usernames of people joining? (comma separated)",
      name: "memberUsernames",
      type: "text",
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Plan Your Trip</h1>
      <div className="mb-4">
        <label className="block text-sm mb-1">
          {questions[step - 1].label}
        </label>
        <input
          type={questions[step - 1].type}
          name={questions[step - 1].name}
          value={formData[questions[step - 1].name]}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex justify-between">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="bg-gray-300 text-sm px-4 py-2 rounded"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        )}
      </div>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
};

export default CreateTrip;
