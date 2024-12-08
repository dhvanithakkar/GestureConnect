import React, { useEffect, useRef, useState } from 'react';
import { Hand, Type } from 'lucide-react';

// Define the type for sign language detection results
interface SignDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  sign: string;
  confidence: number;
}

const SignLanguageDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signs, setSigns] = useState<SignDetection[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const setupWebSocket = () => {
    // Close existing connection if it exists
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    // Create new WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/sign-language-detection');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setConnectionAttempts(0);
    };

    ws.onmessage = (event) => {
      try {
        const detections: SignDetection[] = JSON.parse(event.data);
        setSigns(detections);
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
  }, []);

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
                style={{ transform: 'translateY(100%)' }}
              >
                <Type className="w-3 h-3" />
                {sign.sign} ({(sign.confidence * 100).toFixed(1)}%)
              </div>
              <div className="absolute top-0 right-0">
                <Hand color="blue" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignLanguageDetector;