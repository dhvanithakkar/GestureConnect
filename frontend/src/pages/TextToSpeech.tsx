import React, { useState } from 'react';
import { MessageSquare, Play, Pause, Save } from 'lucide-react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [speed, setSpeed] = useState(1);
  const [style, setStyle] = useState(0);
  const [voiceID, setVoiceID] = useState('JBFqnCBsd6RMkjVDRZzb');

  const convertTextToSpeech = async () => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:8000/labs-tts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, speed, style, voiceID }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
      };
      setAudioElement(audio);

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
      convertTextToSpeech();
    } else if (audioElement) {
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
      convertTextToSpeech().then(() => {
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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Selection
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={voiceID}
                    onChange={(e) => setVoiceID(e.target.value)}
                  >
                    <option value="JBFqnCBsd6RMkjVDRZzb">George</option>
                    <option value="9BWtsMINqrJLrRacOk9x">Aria</option>
                    <option value="SAz9YHcvj6GT2YYXdXww">River</option>
                    <option value="bIHbv24MWmeRgasZH58o">Will</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Rate: <span className="font-bold">{speed.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    className="w-full"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style: <span className="font-bold">{style}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full"
                    value={style}
                    onChange={(e) => setStyle(Number(e.target.value))}
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
