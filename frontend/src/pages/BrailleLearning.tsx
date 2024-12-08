import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award } from 'lucide-react';

const BrailleLearning = () => {
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [currentLesson, setCurrentLesson] = useState(1);

  const brailleCharacters = [
    { symbol: '⠁', letter: 'a', dots: '1' },
    { symbol: '⠃', letter: 'b', dots: '1-2' },
    { symbol: '⠉', letter: 'c', dots: '1-4' },
    { symbol: '⠙', letter: 'd', dots: '1-4-5' },
    { symbol: '⠑', letter: 'e', dots: '1-5' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learn Braille</h1>
          <p className="text-xl text-gray-600">
            Interactive lessons to master reading and writing Braille
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Learning Path</h2>
            <div className="space-y-4">
              <button
                className={`w-full py-2 px-4 rounded-lg text-left ${
                  selectedLevel === 'beginner'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedLevel('beginner')}
              >
                Beginner
              </button>
              <button
                className={`w-full py-2 px-4 rounded-lg text-left ${
                  selectedLevel === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedLevel('intermediate')}
              >
                Intermediate
              </button>
              <button
                className={`w-full py-2 px-4 rounded-lg text-left ${
                  selectedLevel === 'advanced'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedLevel('advanced')}
              >
                Advanced
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Lesson {currentLesson} of 20</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 md:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Current Lesson</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {brailleCharacters.map((char) => (
                <div
                  key={char.letter}
                  className="p-4 bg-gray-50 rounded-lg text-center hover:bg-yellow-50 cursor-pointer"
                >
                  <p className="text-4xl mb-2">{char.symbol}</p>
                  <p className="text-lg font-medium">Letter: {char.letter}</p>
                  <p className="text-sm text-gray-600">Dots: {char.dots}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Practice Area</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-gray-600">
                  Click on the characters above to practice writing them
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setCurrentLesson(Math.max(1, currentLesson - 1))}
              >
                Previous Lesson
              </button>
              <button
                className="py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                onClick={() => setCurrentLesson(currentLesson + 1)}
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <GraduationCap className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Video tutorials</li>
              <li>Practice exercises</li>
              <li>Downloadable materials</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <Award className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Complete lessons</li>
              <li>Practice streak</li>
              <li>Mastery badges</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <BookOpen className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Additional Tools</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Braille translator</li>
              <li>Reference guide</li>
              <li>Progress tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrailleLearning;