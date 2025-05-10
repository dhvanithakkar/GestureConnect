import React, { useEffect, useRef, useState } from 'react';
import { Hand, HandMetal, Type, Camera, Upload, Volume2, Mic } from 'lucide-react';

// Define the type for sign language detection results
interface SignDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  sign: string;
  confidence: number;
  hand_side?: string;
}

// Define the type for BSL detection results
interface BSLDetection {
  prediction: string;
  letter: string;
  confidence: number;
  hands_detected: number;
  framerate?: number;
  error?: string;
}

// Define the type for TTS request
interface TTSRequest {
  text: string;
}

const SignLanguageApp: React.FC = () => {
  // Primary state
  const [mode, setMode] = useState<'signToText' | 'textToSign'>('signToText');
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload'>('camera');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('bsl');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Sign-to-text states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [signs, setSigns] = useState<SignDetection[]>([]);
  const [bslSign, setBslSign] = useState<BSLDetection | null>(null);
  const [framerate, setFramerate] = useState<number>(0);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  // Text-to-sign states
  const [textInput, setTextInput] = useState<string>('');
  const [animationFrames, setAnimationFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [signImages, setSignImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // WebSocket setup for sign language detection
  const setupWebSocket = () => {
    // Close existing connection if it exists
    if (websocketRef.current) {
      // websocketRef.current.close();
    }

    // Create new WebSocket - updated to match backend endpoint
    const ws = new WebSocket(`ws://localhost:8000/ws/${selectedLanguage}-sign-language-detection`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setConnectionAttempts(0);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle BSL response format differently
        if (selectedLanguage === 'bsl') {
          const bslData = data as BSLDetection;
          setBslSign(bslData);
          if (bslData.framerate) {
            setFramerate(bslData.framerate);
          }
          
          // Only update translated text if translation is active and there's a prediction
          if (isTranslating && bslData.prediction && bslData.prediction !== 'NO_HANDS_DETECTED' && bslData.prediction !== 'ERROR') {
            // Only add the sign if it's different from the last word in translatedText
            setTranslatedText(prevText => {
              const lastWord = prevText.split(' ').pop() || '';
              if (lastWord !== bslData.letter) {
                return prevText + (prevText ? ' ' : '') + bslData.letter;
              }
              return prevText;
            });
          }
        } else {
          // Handle ASL and ISL response format (array of detections)
          const detections: SignDetection[] = data;
          setSigns(detections);
          
          // Only update translated text if translation is active
          if (isTranslating && detections.length > 0) {
            const signText = detections.map(detection => detection.sign).join(' ');
            // Only add the sign if it's different from the last character in translatedText
            setTranslatedText(prevText => {
              const lastWord = prevText.split(' ').pop() || '';
              if (lastWord !== signText) {
                return prevText + (prevText ? ' ' : '') + signText;
              }
              return prevText;
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      setIsConnected(false);

      // Exponential backoff for reconnection attempts
      const timeout = Math.min(30000, Math.pow(2, connectionAttempts) * 1000);
      setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
        setupWebSocket();
      }, timeout);
    };

    websocketRef.current = ws;
  };

  useEffect(() => {
    if (mode === 'signToText' && inputMethod === 'camera') {
      if (isTranslating) {
        // Setup webcam
        const setupWebcam = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (err) {
            console.error("Error accessing webcam:", err);
          }
        };

        setupWebcam();
        setupWebSocket();

        // Frame capture and WebSocket send interval
        intervalRef.current = window.setInterval(() => {
          if (videoRef.current && canvasRef.current && websocketRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');

            if (context && websocketRef.current.readyState === WebSocket.OPEN) {
              // Set canvas dimensions to match video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;

              // Draw current video frame
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Convert canvas to base64
              const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

              // Send via WebSocket
              websocketRef.current.send(base64Image);
            }
          }
        }, 200);
      } else {
        // Clear interval when not translating
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      // Cleanup
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if (websocketRef.current) {
          // websocketRef.current.close();
        }
      };
    } else if (mode === 'signToText' && websocketRef.current) {
      // Close WebSocket if not in camera mode
      // websocketRef.current.close();
      websocketRef.current = null;
    }
  }, [mode, inputMethod, selectedLanguage, connectionAttempts, isTranslating]);

  // Reset display states when changing language
  useEffect(() => {
    setBslSign(null);
    setSigns([]);
    setTranslatedText('');
    
    // Close existing websocket connection to create a new one with the correct endpoint
    if (websocketRef.current) {
      // websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (isTranslating) {
      setupWebSocket();
    }
  }, [selectedLanguage]);

  // Handle file upload for image processing
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && websocketRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle translation state
  const toggleTranslation = () => {
    if (isTranslating) {
      // Stop translation
      setIsTranslating(false);
      
      // Stop frame capture interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Don't close the WebSocket connection - keep it ready for the next translation
    } else {
      // Start translation
      setIsTranslating(true);
      setTranslatedText('');
      setSigns([]);
      setBslSign(null);
      
      // Ensure WebSocket connection is active
      if (!isConnected && websocketRef.current?.readyState !== WebSocket.OPEN) {
        setupWebSocket();
      }
      
      // If using camera, ensure webcam is running
      if (inputMethod === 'camera') {
        if (!videoRef.current?.srcObject) {
          // Attempt to initialize webcam if not already running
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            })
            .catch(err => {
              console.error("Error accessing webcam:", err);
              alert("Could not access webcam. Please check permissions.");
            });
        }
      } else if (inputMethod === 'upload') {
        // For upload method, prompt user to select a file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();
        
        fileInput.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file && websocketRef.current) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = (e.target?.result as string).split(',')[1];
              if (websocketRef.current?.readyState === WebSocket.OPEN) {
                websocketRef.current.send(base64);
              } else {
                alert("WebSocket connection not available. Please try again.");
              }
            };
            reader.readAsDataURL(file);
          }
        };
      }
      
      // Provide user feedback that translation has started
      console.log(`Starting translation from ${selectedLanguage} to ${targetLanguage}`);
    }
  };

  // Handle text-to-sign translation
  const handleTextToSignTranslation = () => {
    if (!textInput) return;
    
    setIsLoading(true);
    
    // Clean up the input text (uppercase for consistency, remove special characters)
    const cleanedText = textInput.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    
    // Generate image paths for each character
    const imagePaths = cleanedText.split('').map(char => {
      // For spaces, use a special image or just return empty
      if (char === ' ') {
        return `/${selectedLanguage}/space.jpg`;
      }
      // Path to the image based on the character and selected sign language
      return `/${selectedLanguage}/${char}.jpg`;
    });
    
    setSignImages(imagePaths);
    setAnimationFrames(cleanedText.split(''));
    setCurrentFrame(0);
    setIsLoading(false);
  };

  // Render BSL detection overlay
  const renderBSLOverlay = () => {
    if (!bslSign || !bslSign.prediction || bslSign.prediction === 'NO_HANDS_DETECTED') {
      return null;
    }
    
    return (
      <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          <span className="font-semibold">{bslSign.letter}</span>
          <span>({(bslSign.confidence * 100).toFixed(1)}%)</span>
        </div>
        <div className="text-xs mt-1">
          Hands: {bslSign.hands_detected} | FPS: {framerate.toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          {mode === 'signToText' ? (
            <Hand className="w-16 h-16 text-green-600 mx-auto mb-4" />
          ) : (
            <HandMetal className="w-16 h-16 text-green-600 mx-auto mb-4" />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign Language Translation</h1>
          <p className="text-xl text-gray-600">
            Convert between ASL, BSL, and ISL with real-time recognition
          </p>
          <div className="flex items-center justify-center mt-4">
            <span className={`ml-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <select 
            className="w-full p-2 border rounded-lg"
            value={mode} 
            onChange={(e) => setMode(e.target.value as 'signToText' | 'textToSign')}
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

                <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-6">
                  {inputMethod === 'camera' ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <canvas 
                        ref={canvasRef} 
                        style={{ display: 'none' }} 
                      />
                      {/* Render either BSL overlay or ASL/ISL detection boxes based on selected language */}
                      {selectedLanguage === 'bsl' ? (
                        renderBSLOverlay()
                      ) : (
                        signs.map((sign, index) => (
                          <div 
                            key={index} 
                            // className="absolute border-2 border-blue-500 flex items-center"
                            style={{
                              left: `${sign.x}px`,
                              top: `${sign.y}px`,
                              width: `${sign.width}px`,
                              height: `${sign.height}px`
                            }}
                          >
                            <div 
                              className="absolute bottom-full left-0 bg-blue-500 text-white text-xs px-1 rounded flex items-center gap-1"
                            >
                              <Type className="w-3 h-3" />
                              {sign.sign} ({(sign.confidence * 100).toFixed(1)}%)
                              {sign.hand_side && ` - ${sign.hand_side}`}
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <label className="cursor-pointer text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Drop your image here or click to browse</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                        />
                      </label>
                    </div>
                  )}
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
                    <option value="isl">American Sign Language (ASL)</option>
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
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>

              <button 
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  isTranslating 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                onClick={toggleTranslation}
              >
                {isTranslating ? 'Stop Translation' : 'Start Translation'}
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
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="isl">American Sign Language (ASL)</option>
                    <option value="bsl">British Sign Language (BSL)</option>
                    <option value="isl">Indian Sign Language (ISL)</option>
                  </select>
                </div>
              </div>

              <button 
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleTextToSignTranslation}
                disabled={isLoading || !textInput}
              >
                {isLoading ? 'Loading...' : 'Translate to Sign Language'}
              </button>
            </div>
          )}

          <div className="space-y-8">
            {mode === 'signToText' ? (
              <>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Translation Result</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isTranslating 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isTranslating ? 'Translating...' : 'Idle'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
                    {translatedText ? (
                      <p className="text">{translatedText}</p>
                    ) : (
                      <p className="text-gray-500">
                        {isTranslating 
                          ? 'Waiting for signs to translate...' 
                          : 'Translation will appear here when you start translating'}
                      </p>
                    )}
                  </div>
                  <audio ref={audioRef} style={{ display: 'none' }} />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-semibold mb-4">Language Comparison</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">{selectedLanguage.toUpperCase()}</h3>
                        <p className="text-gray-600">
                          {selectedLanguage === 'bsl' ? (
                            bslSign && bslSign.prediction !== 'NO_HANDS_DETECTED' 
                              ? bslSign.letter
                              : isTranslating 
                                ? 'Waiting for signs...' 
                                : 'Start translation to detect signs'
                          ) : (
                            signs.length > 0 
                              ? signs.map(sign => sign.sign).join(' ') 
                              : isTranslating 
                                ? 'Waiting for signs...' 
                                : 'Start translation to detect signs'
                          )}
                        </p>
                        {/* Show BSL stats if applicable */}
                        {selectedLanguage === 'bsl' && bslSign && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Hands detected: {bslSign.hands_detected}</p>
                            <p>Confidence: {(bslSign.confidence * 100).toFixed(1)}%</p>
                            <p>Framerate: {framerate.toFixed(1)} FPS</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">{targetLanguage.toUpperCase()}</h3>
                        <p className="text-gray-600">
                          {translatedText || 
                            (isTranslating 
                              ? 'Waiting for translation...' 
                              : 'Start translation to see results'
                            )
                          }
                        </p>
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
                        {/* Display image from path instead of placeholder text */}
                        {signImages[currentFrame] ? (
                          <div className="flex flex-col items-center">
                            <img 
                              src={signImages[currentFrame]} 
                              alt={`Sign for ${animationFrames[currentFrame]}`}
                              className="max-w-full max-h-64 object-contain mb-4"
                              onError={(e) => {
                                // If image fails to load, show a placeholder
                                (e.target as HTMLImageElement).src = "/api/placeholder/200/200";
                                (e.target as HTMLImageElement).alt = "Image not available";
                              }}
                            />
                            <p className="text-xl font-medium mt-2">
                              {animationFrames[currentFrame] === " " ? "SPACE" : animationFrames[currentFrame]}
                            </p>
                          </div>
                        ) : (
                          <p>Loading image...</p>
                        )}
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

export default SignLanguageApp;