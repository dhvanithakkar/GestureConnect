import React, { useState } from 'react';
import { HandMetal, Upload, Camera } from 'lucide-react';
import SignLanguageDetector from '../components/SignLanguageDetection';

const SignLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('asl');
  const [targetLanguage, setTargetLanguage] = useState('bsl');
  const [inputMethod, setInputMethod] = useState('camera');
  const [mode, setMode] = useState('signToText');
  const [textInput, setTextInput] = useState('');
  const [animationFrames, setAnimationFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Simulate fetching sign language images for each character
  const handleTextToSignTranslation = () => {
    if (!textInput) return;
    
    // Create an array of placeholder frames for each character
    // In a real app, these would be fetched from a backend
    const frames = textInput.split('').map(char => {
      return `Sign for "${char.toUpperCase()}"`;
    });
    
    setAnimationFrames(frames);
    setCurrentFrame(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <HandMetal className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign Language Translation</h1>
          <p className="text-xl text-gray-600">
            Convert between ASL, BSL, and ISL with real-time recognition
          </p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <select 
            className="w-full p-2 border rounded-lg"
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="signToText">Sign to Text</option>
            <option value="textToSign">Text to Sign</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {mode === 'signToText' ? (
            // Sign to Text Mode
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
          ) : (
            // Text to Sign Mode
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Text to Sign Translation</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Text to Translate
                </label>
                <textarea 
                  className="w-full p-3 border rounded-lg h-32 resize-none" 
                  placeholder="Type your text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Sign Language
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  >
                    <option value="asl">American Sign Language (ASL)</option>
                    <option value="bsl">British Sign Language (BSL)</option>
                    <option value="isl">Indian Sign Language (ISL)</option>
                  </select>
                </div>
              </div>

              <button 
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleTextToSignTranslation}
              >
                Translate to Sign Language
              </button>
            </div>
          )}

          <div className="space-y-8">
            {mode === 'signToText' ? (
              <>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-semibold mb-4">Translation Result</h2>
                  <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
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
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-4">Sign Language Animation</h2>
                <div className="p-4 bg-gray-100 rounded-lg flex flex-col items-center">
                  <div className="w-full aspect-square bg-white flex items-center justify-center rounded-lg mb-6 shadow-inner">
                    {animationFrames.length > 0 ? (
                      <div className="text-center">
                        <div className="text-6xl mb-4">{textInput[currentFrame]}</div>
                        <p className="text-xl font-medium">{animationFrames[currentFrame]}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Sign language will appear here</p>
                    )}
                  </div>
                  
                  {animationFrames.length > 0 && (
                    <div className="w-full">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress:</span>
                        <span className="text-sm font-medium">
                          {currentFrame + 1} of {animationFrames.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${((currentFrame + 1) / animationFrames.length) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-4 gap-2">
                        <button
                          onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                          disabled={currentFrame === 0}
                          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentFrame(Math.min(animationFrames.length - 1, currentFrame + 1))}
                          disabled={currentFrame === animationFrames.length - 1}
                          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguage;