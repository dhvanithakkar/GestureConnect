import React, { useEffect, useRef, useState } from 'react';
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

const EmotionIcons = {
  'angry': <AlertTriangle color="red" />,
  'disgust': <Droplet color="green" />,
  'fear': <AlertTriangle color="purple" />,
  'happy': <Smile color="yellow" />,
  'neutral': <Meh color="gray" />,
  'sad': <Frown color="blue" />,
  'surprise': <Compass color="orange" />
};

const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotions, setEmotions] = useState<EmotionDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

    // Setup WebSocket connection
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
        const detections: EmotionDetection[] = JSON.parse(event.data);
        setEmotions(detections);
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

    setupWebcam();
    setupWebSocket();

    // Frame capture and WebSocket send interval
    const intervalId = setInterval(() => {
      if (videoRef.current && canvasRef.current && websocketRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw current video frame
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to base64
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

          // Send via WebSocket if connection is open
          if (websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(base64Image);
          }
        }
      }
    }, 200); // Reduced interval to 200ms to reduce load

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

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
          {emotions.map((emotion, index) => (
            <div 
              key={index} 
              className="absolute border-2 border-green-500 flex items-center"
              style={{
                left: `${emotion.x}px`,
                top: `${emotion.y}px`,
                width: `${emotion.width}px`,
                height: `${emotion.height}px`
              }}
            >
              <div 
                className="absolute bottom-full left-0 bg-green-500 text-white text-xs px-1 rounded"
                style={{ transform: 'translateY(100%)' }}
              >
                {emotion.emotion} ({(emotion.confidence * 100).toFixed(1)}%)
              </div>
              <div className="absolute top-0 right-0">
                {EmotionIcons[emotion.emotion as keyof typeof EmotionIcons]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;