import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Smile, Frown, Meh, Compass, Droplet } from 'lucide-react';

// Define the type for emotion detection results
interface EmotionDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  emotion: string;
  confidence: number;
  sound?: string;
}

// Define all possible emotions with their corresponding icons
const ALL_EMOTIONS = {
  'angry': { icon: <AlertTriangle color="red" />, color: 'bg-red-600' },
  'disgust': { icon: <Droplet color="green" />, color: 'bg-green-600' },
  'fear': { icon: <AlertTriangle color="purple" />, color: 'bg-purple-600' },
  'happy': { icon: <Smile color="yellow" />, color: 'bg-yellow-500' },
  'neutral': { icon: <Meh color="gray" />, color: 'bg-gray-500' },
  'sad': { icon: <Frown color="blue" />, color: 'bg-blue-600' },
  'surprise': { icon: <Compass color="orange" />, color: 'bg-orange-500' }
};

const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotions, setEmotions] = useState<EmotionDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

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

  // Create a map of all emotions with their confidence values from the detected emotions
  const emotionConfidenceMap = Object.keys(ALL_EMOTIONS).reduce((acc, emotion) => {
    acc[emotion] = 0; // Default to 0 confidence
    return acc;
  }, {} as Record<string, number>);

  // Update confidence values for detected emotions
  emotions.forEach(detection => {
    if (detection.emotion in emotionConfidenceMap) {
      emotionConfidenceMap[detection.emotion] = Math.max(
        emotionConfidenceMap[detection.emotion], 
        detection.confidence
      );
    }
  });

  return (
    <div className="emotion-detector p-4 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Emotion Recognizer 
          <span className={`ml-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </h1>
        
        <div className="relative max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full"
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
              <div className="absolute top-0 right-0 bg-white bg-opacity-50 rounded-full p-1">
                {ALL_EMOTIONS[emotion.emotion as keyof typeof ALL_EMOTIONS]?.icon || <Meh color="gray" />}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 max-w-2xl mx-auto">
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

        <div className="border-t pt-6 mt-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Emotion Dashboard</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ALL_EMOTIONS).map(([emotion, {icon, color}]) => {
              const confidence = emotionConfidenceMap[emotion] || 0;
              
              return (
                <div key={emotion} className="bg-white shadow p-4 rounded-lg">
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
                  <p className="text-xs text-right mt-1">{(confidence * 100).toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;