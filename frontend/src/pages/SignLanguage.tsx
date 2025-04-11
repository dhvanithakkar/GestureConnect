import React, { useState } from 'react';
import { HandMetal, Upload, Camera } from 'lucide-react';
import SignLanguageDetector from '../components/SignLanguageDetection';
import EmotionDetector from '../components/EmotionDetectionStream';

const SignLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('asl');
  const [targetLanguage, setTargetLanguage] = useState('bsl');
  const [inputMethod, setInputMethod] = useState('camera');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <HandMetal className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign Language Translation</h1>
          <p className="text-xl text-gray-600">
            Convert between ASL, BSL, and ISL with real-time recognition
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    inputMethod === 'camera'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setInputMethod('camera')}
                >
                  <Camera className="w-5 h-5 mx-auto" />
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    inputMethod === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setInputMethod('upload')}
                >
                  <Upload className="w-5 h-5 mx-auto" />
                </button>
              </div>

              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  {inputMethod === 'camera' ? (
                              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-6">
                              Camera feed or upload section would go here
                              {/* <SignLanguageDetector /> */}
                            </div>
                  
                    // <p className="text-gray-500">Camera feed will appear here</p>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Drop your video or image here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Language
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="asl">American Sign Language (ASL)</option>
                  <option value="bsl">British Sign Language (BSL)</option>
                  <option value="isl">Indian Sign Language (ISL)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  <option value="bsl">British Sign Language (BSL)</option>
                  <option value="asl">American Sign Language (ASL)</option>
                  <option value="isl">Indian Sign Language (ISL)</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Start Translation
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Translation Result</h2>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
                {/* <p className="text-gray-500">Translation will appear here...</p> */}
                <p className="text">IPD</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Language Comparison</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{selectedLanguage.toUpperCase()}</h3>
                    <p className="text-gray-600">Original sign</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{targetLanguage.toUpperCase()}</h3>
                    <p className="text-gray-600">Translated sign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguage;