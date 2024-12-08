import React, { useState } from 'react';
import { Mic, Download, Copy } from 'lucide-react';

const SpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Mic className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Speech to Text</h1>
          <p className="text-xl text-gray-600">
            Convert spoken words into text with high accuracy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  isRecording
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className="w-16 h-16" />
              </div>
              <p className="text-lg font-medium">
                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recognition Mode
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Continuous Recognition</option>
                    <option>Single Phrase</option>
                    <option>Command Mode</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Transcribed Text</h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[300px]">
                {transcribedText || (
                  <p className="text-gray-500">Your transcribed text will appear here...</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Real-time transcription
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Multiple language support
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Punctuation detection
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Export to multiple formats
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;