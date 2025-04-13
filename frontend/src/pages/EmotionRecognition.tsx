import React from 'react';
import { Brain } from 'lucide-react';
import EmotionDetector from '../components/EmotionDetectionStream';
const EmotionRecognition = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emotion Recognition</h1>
          <p className="text-xl text-gray-600">
            Understand emotions in real-time using advanced AI technology
          </p>
        </div>

        <div className="bg-white">
          {/* <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-6"> */}
            {/* Camera feed or upload section would go here */}
            <EmotionDetector />
          {/* </div> */}

        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4 text-gray-600">
            <p>
              Our emotion recognition system uses advanced computer vision and machine learning
              algorithms to detect and analyze facial expressions in real-time.
            </p>
            <p>
              The system can identify seven basic emotions: happiness, sadness, anger, surprise,
              fear, disgust, and neutral.
            </p>
            <p>
              Simply enable your camera or upload an image to start analyzing emotions with high
              accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionRecognition;