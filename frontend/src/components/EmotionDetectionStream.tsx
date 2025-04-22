import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AlertTriangle, Smile, Frown, Meh, Compass, Droplet } from 'lucide-react';

// Define the type for emotion detection results
interface EmotionDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  emotion: string;
  confidence: number;
}

// Define all possible emotions with their corresponding icons and sounds
const ALL_EMOTIONS = {
  'angry': {
    icon: <AlertTriangle className="h-6 w-6" color="red" />,
    color: 'bg-red-600',
    sound: '../../sounds/angry.mp3' // Adjusted path relative to src/components
  },
  'disgust': {
    icon: <Droplet className="h-6 w-6" color="green" />,
    color: 'bg-green-600',
    sound: '../../sounds/neutral.mp3' // Adjusted path relative to src/components
  },
  'fear': {
    icon: <AlertTriangle className="h-6 w-6" color="purple" />,
    color: 'bg-purple-600',
    sound: '../../sounds/fear.mp3' // Adjusted path relative to src/components
  },
  'happy': {
    icon: <Smile className="h-6 w-6" color="#FFD700" />,
    color: 'bg-yellow-500',
    sound: '../../sounds/happy.mp3' // Adjusted path relative to src/components
  },
  'neutral': {
    icon: <Meh className="h-6 w-6" color="gray" />,
    color: 'bg-gray-500',
    sound: '' // You might want to handle this case if needed
  },
  'sad': {
    icon: <Frown className="h-6 w-6" color="blue" />,
    color: 'bg-blue-600',
    sound: '../../sounds/sad.mp3' // Adjusted path relative to src/components
  },
  'surprise': {
    icon: <Compass className="h-6 w-6" color="orange" />,
    color: 'bg-orange-500',
    sound: '../../sounds/surprise.mp3' // Adjusted path relative to src/components
  }
};


const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotions, setEmotions] = useState<EmotionDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const lastPlayedTimeRef = useRef<Record<string, number>>({});
  const emotionThresholdsPassedRef = useRef<Record<string, boolean>>({});

  // Initialize audio elements for each emotion
  useEffect(() => {
    Object.entries(ALL_EMOTIONS).forEach(([emotion, { sound }]) => {
      const audio = new Audio(sound);
      audioRefs.current[emotion] = audio;
      lastPlayedTimeRef.current[emotion] = 0;
    });
  }, []);

  // Function to capture and send a frame
  const captureAndSendFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current && websocketRef.current && isDetecting) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        // Send via WebSocket if connection is open
        if (websocketRef.current.readyState === WebSocket.OPEN) {
          websocketRef.current.send(base64Image);
        }
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(captureAndSendFrame);
    }
  }, [isDetecting]);

  // Setup webcam
  useEffect(() => {
    const setupWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    setupWebcam();

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const setupWebSocket = () => {
      // Close any existing connection
      if (websocketRef.current) {
        websocketRef.current.close();
      }

      // Create new WebSocket connection
      websocketRef.current = new WebSocket('ws://localhost:8000/ws/emotion-detection');

      websocketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const detections: EmotionDetection[] = JSON.parse(event.data);
          console.log('Received emotion detections:', detections);
          
          // Immediately update emotions state with new data
          setEmotions(detections);
        } catch (error) {
          console.error('Error parsing emotion data:', error);
        }
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(setupWebSocket, 3000);
      };
    };

    setupWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  // Handle frame capture using requestAnimationFrame
  useEffect(() => {
    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(captureAndSendFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, captureAndSendFrame]);

  // Toggle detection state
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(base64Image.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Use useMemo to calculate emotion confidence map to prevent infinite loops
  const emotionConfidenceMap = useMemo(() => {
    // Create a map of all emotions with their confidence values from the detected emotions
    const confidenceMap = Object.keys(ALL_EMOTIONS).reduce((acc, emotion) => {
      acc[emotion] = 0; // Default to 0 confidence
      return acc;
    }, {} as Record<string, number>);

    // Update confidence values for detected emotions
    emotions.forEach(detection => {
      if (detection.emotion in confidenceMap) {
        confidenceMap[detection.emotion] = Math.max(
          confidenceMap[detection.emotion], 
          detection.confidence
        );
      }
    });

    return confidenceMap;
  }, [emotions]);

  // Play sounds when emotion confidence passes threshold (60%)
  // Use useEffect with emotionConfidenceMap dependency to handle threshold crossing
  useEffect(() => {
    const THRESHOLD = 0.6; // 60% confidence threshold
    const COOLDOWN_MS = 3000; // 3 seconds cooldown between sounds for the same emotion
    const currentTime = Date.now();

    Object.entries(emotionConfidenceMap).forEach(([emotion, confidence]) => {
      const previouslyPassed = emotionThresholdsPassedRef.current[emotion] || false;
      const nowPassing = confidence >= THRESHOLD;
      
      // Update our ref with current threshold status
      emotionThresholdsPassedRef.current[emotion] = nowPassing;
      
      // Play sound if we just crossed the threshold and haven't played recently
      if (nowPassing && !previouslyPassed && audioRefs.current[emotion]) {
        const lastPlayed = lastPlayedTimeRef.current[emotion] || 0;
        if (currentTime - lastPlayed > COOLDOWN_MS) {
          console.log(`Playing sound for ${emotion} at ${confidence.toFixed(2)} confidence`);
          
          // Play the sound
          audioRefs.current[emotion].currentTime = 0;
          audioRefs.current[emotion].play().catch(err => console.error(`Error playing sound for ${emotion} at ${confidence.toFixed(2)} confidence:`, err));
          
          // Update last played time
          lastPlayedTimeRef.current[emotion] = currentTime;
        }
      }
    });
  }, [emotionConfidenceMap]);

  // Create a new state for UI purposes based on the thresholds ref
  const [displayThresholds, setDisplayThresholds] = useState<Record<string, boolean>>({});
  
  // Update the display thresholds state less frequently to avoid render loops
  useEffect(() => {
    // Use a timeout to avoid tight render loops
    const timeoutId = setTimeout(() => {
      setDisplayThresholds({...emotionThresholdsPassedRef.current});
    }, 100); // Update display every 100ms
    
    return () => clearTimeout(timeoutId);
  }, [emotionConfidenceMap]);

  return (
    <div className="emotion-detector p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          Emotion Detector
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </h1>
        
        <div className="relative mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-auto"
          />
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }} 
          />
          
          {/* Overlay detected emotions on video */}
          {emotions.map((emotion, index) => (
            <div 
              key={index} 
              className="absolute border-2 border-green-500 flex items-center justify-center"
              style={{
                left: `${emotion.x}px`,
                top: `${emotion.y}px`,
                width: `${emotion.width}px`,
                height: `${emotion.height}px`
              }}
            >
              <div 
                className="absolute top-0 left-0 transform -translate-y-full bg-green-500 text-white text-xs px-1 py-0.5 rounded"
              >
                {emotion.emotion} ({(emotion.confidence * 100).toFixed(1)}%)
              </div>
              <div className="absolute top-0 right-0 bg-white bg-opacity-75 rounded-full p-1">
                {ALL_EMOTIONS[emotion.emotion as keyof typeof ALL_EMOTIONS]?.icon || <Meh className="h-6 w-6" color="gray" />}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button 
            className={`py-2 px-4 rounded-lg transition-colors ${
              isDetecting 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={toggleDetection}
          >
            {isDetecting ? 'Stop Detection' : 'Start Detection'}
          </button>
          
          <label className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-center">
            Upload Image
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="pt-6 mt-6">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Emotion Dashboard</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(ALL_EMOTIONS).map(([emotion, {icon, color}]) => {
              const confidence = emotionConfidenceMap[emotion] || 0;
              const threshold = 0.6; // 60% threshold
              const isPastThreshold = confidence >= threshold;
              
              return (
                <div key={emotion} className={`bg-white shadow p-4 rounded-lg border ${isPastThreshold ? 'border-green-500 animate-pulse' : 'border-transparent'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">
                      {icon}
                    </div>
                    <p className="font-medium capitalize">{emotion}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className={`${color} h-2.5 rounded-full transition-all duration-300`} 
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className={isPastThreshold ? 'font-bold' : ''}>
                      {isPastThreshold && '🔊'}
                    </span>
                    <span className={`${isPastThreshold ? 'font-bold' : ''}`}>
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Audio feedback is played when an emotion passes 60% confidence threshold</p>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;