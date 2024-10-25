// src/components/AiAssistant.js
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Adjust this path based on your project structure

const AiAssistant = ({ user, notes }) => { // Add notes as props
  const [selectedNote, setSelectedNote] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    if (!selectedNote || !prompt) return;
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEM_API); // Replace with your actual API key
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const result = await model.generateContent(`${prompt}: ${selectedNote.content}`);
      setAiResponse(result.response.text());
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-4 top-16 w-80 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-2">AI Assistant</h2>

      {/* Note Selection Dropdown */}
      <select
        onChange={(e) => setSelectedNote(JSON.parse(e.target.value))}
        className="mb-2 border rounded w-full"
      >
        <option value="">Select a Note</option>
        {notes.map((note) => (
          <option key={note.id} value={JSON.stringify(note)}>
            {note.title}
          </option>
        ))}
      </select>

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something about the note..."
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={generateSummary}
        className="bg-blue-500 text-white p-2 rounded shadow-md hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Get Summary'}
      </button>

      {/* AI Response Display */}
      {aiResponse && (
        <div className="mt-4 p-2 bg-gray-100 border rounded max-h-60 overflow-y-auto">
          <h3 className="font-semibold">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
