import React from 'react';
import { Brain, HandMetal, MessageSquare, Mic, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Accessibility Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering communication and understanding through cutting-edge artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/emotion" className="transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Emotion Recognition</h2>
              <p className="text-gray-600">
                Advanced AI technology to detect and analyze human emotions in real-time
              </p>
            </div>
          </Link>

          <Link to="/sign-language" className="transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <HandMetal className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Sign Language Recognition</h2>
              <p className="text-gray-600">
                Bridging communication gaps with ISL recognition and interpretation
              </p>
            </div>
          </Link>

          <Link to="/text-to-speech" className="transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Text to Speech</h2>
              <p className="text-gray-600">
                Convert written text into natural-sounding speech instantly
              </p>
            </div>
          </Link>
        
        <Link to="/speech-to-text" className="transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-lg shadow-lg p-8">
            <Mic className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Speech to Text</h2>
              <p className="text-gray-600">
                Speak Freely, See Clearly: Transforming Speech into Text Seamlessly
              </p>
            </div>
          </Link>
        <Link to="/braille" className="transform hover:scale-105 transition-transform">
            <div className="bg-white rounded-lg shadow-lg p-8">
            <BookOpen className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Learn Braille</h2>
              <p className="text-gray-600">
                Empowering Communication: Learn Braille, Unlock Possibilities.
              </p>
            </div>
          </Link>
        </div>
        

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">About Our Project</h2>
          <div className="max-w-3xl mx-auto text-gray-600 space-y-4">
            <p>
              Our project aims to make communication more accessible and inclusive for everyone through
              the power of artificial intelligence and machine learning.
            </p>
            <p>
              We've developed three main features that work together to break down communication
              barriers and create a more connected world.
            </p>
            <p>
              Whether you're looking to understand emotions, interpret sign language, or convert text
              to speech, our tools are designed to be intuitive and effective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;