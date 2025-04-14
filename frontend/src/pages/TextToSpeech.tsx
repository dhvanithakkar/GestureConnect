import React, { useState } from 'react';
import { MessageSquare, Play, Pause, Save } from 'lucide-react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const convertTextToSpeech = async () => {
    if (!text.trim()) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:8000/labs-tts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }
      else{
        console.log(response);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Create and configure audio element
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
      };
      setAudioElement(audio);
      
      // Auto-play the audio
      audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error converting text to speech:', error);
      alert('Failed to convert text to speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioElement && !isPlaying) {
      // First time playing, need to convert
      convertTextToSpeech();
    } else if (audioElement) {
      // Toggle play/pause
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const saveAudio = () => {
    if (!audioUrl) {
      // If no audio generated yet, generate it first
      convertTextToSpeech().then(() => {
        // After generation, trigger download
        triggerDownload();
      });
    } else {
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'speech.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <MessageSquare className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Text to Speech</h1>
          <p className="text-xl text-gray-600">
            Convert your text into natural-sounding speech instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Enter Text</h2>
            <textarea
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            <div className="mt-4 flex space-x-4">
              <button
                className={`flex-1 ${isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                onClick={handlePlayPause}
                disabled={isLoading || !text.trim()}
              >
                {isLoading ? (
                  'Converting...'
                ) : isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" /> Play
                  </>
                )}
              </button>
              <button 
                className={`flex-1 ${isLoading || !text.trim() ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                onClick={saveAudio}
                disabled={isLoading || !text.trim()}
              >
                <Save className="w-5 h-5 mr-2" /> Save Audio
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Voice Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Selection
                  </label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="JBFqnCBsd6RMkjVDRZzb">Natural Voice 1</option>
                    <option>Natural Voice 2</option>
                    <option>Natural Voice 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Rate
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    className="w-full"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pitch</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    className="w-full"
                    defaultValue="1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Natural-sounding voices
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Multiple language support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Adjustable speaking rate
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Save audio files
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;