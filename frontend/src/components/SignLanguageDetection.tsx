import React, { useEffect, useRef, useState } from 'react';
import { Hand, Type, Camera, Upload, Volume2, Mic } from 'lucide-react';

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

const SignLanguageDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [signs, setSigns] = useState<SignDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload'>('camera');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('isl');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const setupWebSocket = () => {
    // Close existing connection if it exists
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    // Create new WebSocket - updated to match backend endpoint
    const ws = new WebSocket('ws://localhost:8000/ws/isl-sign-language-detection');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setConnectionAttempts(0);
    };

    ws.onmessage = (event) => {
      try {
        const detections: SignDetection[] = JSON.parse(event.data);
        setSigns(detections);
        
        // Update translated text from detections
        if (detections.length > 0) {
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
    if (inputMethod === 'camera') {
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
      const intervalId = setInterval(() => {
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

      // Cleanup
      return () => {
        clearInterval(intervalId);
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      };
    }
  }, [inputMethod, connectionAttempts]);

  // Handle file upload
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

  // Text-to-Speech conversion
  const speakText = async () => {
    if (!translatedText) return;

    try {
      setIsPlaying(true);
      
      const ttsRequest: TTSRequest = { text: translatedText };
      
      const response = await fetch('http://localhost:8000/labs-tts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ttsRequest),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsPlaying(false);
    }
  };

  // Speech-to-text recording
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
        
        // Clean up
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          setAudioStream(null);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob);
      
      const response = await fetch('http://localhost:8000/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTranslatedText(data.text);
    } catch (error) {
      console.error('Error with speech-to-text:', error);
    }
  };

  const startTranslation = () => {
    // Clear previous translation
    setTranslatedText('');
    // Translation is handled in real-time via the WebSocket
  };

  return (
    <div className="sign-language-detector p-4 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <Hand className="w-8 h-8" />
          Sign Language Detector 
          <span className={`ml-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </h1>

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
                  <option value="isl">Indian Sign Language (ISL)</option>
                  <option value="isl">American Sign Language (ASL)</option>
                  <option value="bsl">British Sign Language (BSL)</option>
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
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              onClick={startTranslation}
            >
              Start Translation
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Translation Result</h2>
                <div className="flex gap-2">
                  <button 
                    className={`p-2 rounded-full ${isPlaying ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={speakText}
                    disabled={!translatedText || isPlaying}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button 
                    className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={toggleRecording}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
                {translatedText ? (
                  <p className="text">{translatedText}</p>
                ) : (
                  <p className="text-gray-500">Translation will appear here...</p>
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
                      {signs.length > 0 ? signs.map(sign => sign.sign).join(' ') : 'Waiting for signs...'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{targetLanguage.toUpperCase()}</h3>
                    <p className="text-gray-600">
                      {translatedText || 'Waiting for translation...'}
                    </p>
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

export default SignLanguageDetector;