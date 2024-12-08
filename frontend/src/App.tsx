import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EmotionRecognition from './pages/EmotionRecognition';
import SignLanguage from './pages/SignLanguage';
import TextToSpeech from './pages/TextToSpeech';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SpeechToText from './pages/SpeechToText';
import BrailleLearning from './pages/BrailleLearning';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/emotion" element={<EmotionRecognition />} />
          <Route path="/sign-language" element={<SignLanguage />} />
          <Route path="/text-to-speech" element={<TextToSpeech />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/speech-to-text" element={<SpeechToText />} />
          <Route path="/braille" element={<BrailleLearning />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;