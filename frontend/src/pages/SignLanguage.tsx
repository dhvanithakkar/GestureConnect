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

// Define the type for TTS request
interface TTSRequest {
  text: string;
}

const SignLanguageApp: React.FC = () => {
  // Primary state
  const [mode, setMode] = useState<'signToText' | 'textToSign'>('signToText');
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload'>('camera');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('asl');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Sign-to-text states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [signs, setSigns] = useState<SignDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  // Text-to-sign states
  const [textInput, setTextInput] = useState<string>('');
  const [animationFrames, setAnimationFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [signImages, setSignImages] = useState<string[]>([]);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // WebSocket setup for sign language detection
  const setupWebSocket = () => {
    // Close existing connection if it exists
    if (websocketRef.current) {
      websocketRef.current.close();
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
        const detections: SignDetection[] = JSON.parse(event.data);
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
          websocketRef.current.close();
        }
      };
    } else if (mode === 'signToText' && websocketRef.current) {
      // Close WebSocket if not in camera mode
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, [mode, inputMethod, selectedLanguage, connectionAttempts, isTranslating]);

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

   // Check if image exists with more robust path handling
  const checkImageExists = (imagePath: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imagePath;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  // Handle text-to-sign translation with improved path resolution
  const handleTextToSignTranslation = async () => {
    if (!textInput) return;
    
    // Reset previous state
    setImageLoadError(false);
    setCurrentFrame(0);
    
    // Create an array of image paths for each character
    const chars = textInput.split('');
    const frames: string[] = [];
    const images: string[] = [];
    
    // Process each character
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i].toUpperCase();
      
      // Skip spaces, but keep them in the text
      if (char === ' ') {
        frames.push('Space');
        images.push('');
        continue;
      }
      
      // Create multiple potential paths to the sign language image
      const imagePaths = [
        `${selectedLanguage}/${char}.jpg`,  // Relative to src
        `../${selectedLanguage}/${char}.jpg`,  // Relative to current file
        `/${selectedLanguage}/${char}.jpg`,  // Absolute from project root
        `public/${selectedLanguage}/${char}.jpg`,  // Public folder path
        `${selectedLanguage}/${char}/${char}.jpg`,  // Relative to src
        `../${selectedLanguage}/${char}/${char}.jpg`,  // Relative to current file
        `/${selectedLanguage}/${char}${char}/.jpg`,  // Absolute from project root
        `public/${selectedLanguage}/${char}/${char}.jpg`  // Public folder path
      ];

      
      
      let existingImagePath = '';
      
      // Check each potential path
      for (const path of imagePaths) {
        const exists = await checkImageExists(path);
        if (exists) {
          existingImagePath = path;
          break;
        }
      }
      for (const path of imagePaths) {
        console.log(`Checking path: ${path}`);
        const exists = await checkImageExists(path);
        if (exists) {
          existingImagePath = path;
          console.log(`Found at ${path}`);
          break;
        }
      }
      if (existingImagePath) {
        frames.push(`Sign for "${char}"`);
        images.push(existingImagePath);
      } else {
        // Fallback to text representation if image doesn't exist
        console.log(`No image found for character "${char}" in any of the checked paths`);
        frames.push(`Sign for "${char}" (image not found)`);
        images.push('');
        setImageLoadError(true);
      }
    }
    
    // Update state with frames and images
    setAnimationFrames(frames);
    setSignImages(images);
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
                      {signs.map((sign, index) => (
                        <div 
                          key={index} 
                          className="absolute border-2 border-blue-500 flex items-center"
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
                      ))}
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
                          {signs.length > 0 
                            ? signs.map(sign => sign.sign).join(' ') 
                            : isTranslating 
                              ? 'Waiting for signs...' 
                              : 'Start translation to detect signs'
                          }
                        </p>
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
                        {signImages[currentFrame] ? (
                          <img 
                            src={signImages[currentFrame]} 
                            alt={`Sign for ${textInput[currentFrame].toUpperCase()}`}
                            className="max-h-64 mx-auto mb-4"
                          />
                        ) : (
                          <div className="text-6xl mb-4">
                            {textInput[currentFrame] === ' ' ? '␣' : textInput[currentFrame].toUpperCase()}
                          </div>
                        )}
                        <p className="text-xl font-medium">
                          {animationFrames[currentFrame]}
                        </p>
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