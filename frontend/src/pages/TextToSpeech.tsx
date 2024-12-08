import React, { useState } from 'react';
import { MessageSquare, Play, Pause, Save } from 'lucide-react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <MessageSquare className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Text to Speech</h1>
          <p className="text-xl text-gray-600">
            Convert your text into natural-sounding speech instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Enter Text</h2>
            <textarea
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            <div className="mt-4 flex space-x-4">
              <button
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" /> Play
                  </>
                )}
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" /> Save Audio
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Voice Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Selection
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Natural Voice 1</option>
                    <option>Natural Voice 2</option>
                    <option>Natural Voice 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Rate
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    className="w-full"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pitch</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    className="w-full"
                    defaultValue="1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Natural-sounding voices
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Multiple language support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Adjustable speaking rate
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Save audio files
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;