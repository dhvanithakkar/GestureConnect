import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, HandMetal, MessageSquare, Mic, BookOpen } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">GestureConnect</span>
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/emotion"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/emotion')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Emotion
            </Link>
            <Link
              to="/sign-language"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/sign-language')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <HandMetal className="w-4 h-4 mr-2" />
              Sign Language
            </Link>
            <Link
              to="/text-to-speech"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/text-to-speech')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Text to Speech
            </Link>
            <Link
              to="/speech-to-text"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/speech-to-text')
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              Speech to Text
            </Link>
            <Link
              to="/braille"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/braille')
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Braille
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;