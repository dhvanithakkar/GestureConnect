import React, { useState } from 'react';
import { HandMetal, Upload, Camera } from 'lucide-react';
import SignLanguageDetector from '../components/SignLanguageDetection';

const SignLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('asl');
  const [targetLanguage, setTargetLanguage] = useState('bsl');
  const [inputMethod, setInputMethod] = useState('camera');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <HandMetal className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign Language Translation</h1>
          <p className="text-xl text-gray-600">
            Convert between ASL, BSL, and ISL with real-time recognition
          </p>
        </div>
        <SignLanguageDetector/>
      </div>
    </div>
  );
};

export default SignLanguage;