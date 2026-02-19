"use client";

import React, { useState } from "react";

export default function HotelHelp() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call support service to create ticket
    console.log("Submitting ticket:", { subject, message });
    setSubmitted(true);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Contact Support</h1>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <h3 className="text-lg font-medium text-green-900">
            Ticket Submitted
          </h3>
          <p className="text-green-700 mt-2">
            Our support team will get back to you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-green-600 hover:text-green-800 font-medium"
          >
            Submit another ticket
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded shadow p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit Ticket
          </button>
        </form>
      )}
    </div>
  );
}
