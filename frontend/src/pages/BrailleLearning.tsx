
import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import LessonSelector from './LessonSelector';
import BrailleCharacterDisplay from './BrailleCharacterDisplay';
import BraillePracticeArea from './BraillePracticeArea';
import QuizSection from './QuizSection';

const BrailleLearning = () => {
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'practice', 'quiz'
  const [selectedChar, setSelectedChar] = useState(null);
  
  // Extended character set
  const brailleCharacters = [
    { symbol: '⠁', letter: 'a', dots: '1' },
    { symbol: '⠃', letter: 'b', dots: '1-2' },
    { symbol: '⠉', letter: 'c', dots: '1-4' },
    { symbol: '⠙', letter: 'd', dots: '1-4-5' },
    { symbol: '⠑', letter: 'e', dots: '1-5' },
    { symbol: '⠋', letter: 'f', dots: '1-2-4' },
    { symbol: '⠛', letter: 'g', dots: '1-2-4-5' },
    { symbol: '⠓', letter: 'h', dots: '1-2-5' },
    { symbol: '⠊', letter: 'i', dots: '2-4' },
    { symbol: '⠚', letter: 'j', dots: '2-4-5' },
    { symbol: '⠅', letter: 'k', dots: '1-3' },
    { symbol: '⠇', letter: 'l', dots: '1-2-3' },
    { symbol: '⠍', letter: 'm', dots: '1-3-4' },
    { symbol: '⠝', letter: 'n', dots: '1-3-4-5' },
    { symbol: '⠕', letter: 'o', dots: '1-3-5' },
    { symbol: '⠏', letter: 'p', dots: '1-2-3-4' },
    { symbol: '⠟', letter: 'q', dots: '1-2-3-4-5' },
    { symbol: '⠗', letter: 'r', dots: '1-2-3-5' },
    { symbol: '⠎', letter: 's', dots: '2-3-4' },
    { symbol: '⠞', letter: 't', dots: '2-3-4-5' },
    { symbol: '⠥', letter: 'u', dots: '1-3-6' },
    { symbol: '⠧', letter: 'v', dots: '1-2-3-6' },
    { symbol: '⠺', letter: 'w', dots: '2-4-5-6' },
    { symbol: '⠭', letter: 'x', dots: '1-3-4-6' },
    { symbol: '⠽', letter: 'y', dots: '1-3-4-5-6' },
    { symbol: '⠵', letter: 'z', dots: '1-3-5-6' }
  ];

  // Number representations
  const brailleNumbers = [
    { symbol: '⠼⠁', letter: '1', dots: '3-4-5-6-1' },
    { symbol: '⠼⠃', letter: '2', dots: '3-4-5-6-1-2' },
    { symbol: '⠼⠉', letter: '3', dots: '3-4-5-6-1-4' },
    { symbol: '⠼⠙', letter: '4', dots: '3-4-5-6-1-4-5' },
    { symbol: '⠼⠑', letter: '5', dots: '3-4-5-6-1-5' },
    { symbol: '⠼⠋', letter: '6', dots: '3-4-5-6-1-2-4' },
    { symbol: '⠼⠛', letter: '7', dots: '3-4-5-6-1-2-4-5' },
    { symbol: '⠼⠓', letter: '8', dots: '3-4-5-6-1-2-5' },
    { symbol: '⠼⠊', letter: '9', dots: '3-4-5-6-2-4' },
    { symbol: '⠼⠚', letter: '0', dots: '3-4-5-6-2-4-5' }
  ];

  // Word representations
  const brailleWords = [
    { symbol: '⠞⠓⠑', letter: 'the', dots: '2-3-4_1-2-5_1-5', description: 'Most common word in English' },
    { symbol: '⠁⠝⠙', letter: 'and', dots: '1_1-3-4_1-4-5', description: 'Conjunction connecting words or clauses' },
    { symbol: '⠋⠕⠗', letter: 'for', dots: '1-2-4_1-3-5_1-2-3-5', description: 'Preposition showing purpose' },
    { symbol: '⠺⠊⠞⠓', letter: 'with', dots: '2-4-5-6_2-4_2-3-4_1-2-5', description: 'Preposition indicating accompaniment' },
    { symbol: '⠽⠕⠥', letter: 'you', dots: '1-3-4-5-6_1-3-5_1-3-6', description: 'Second-person pronoun' },
    { symbol: '⠞⠓⠁⠞', letter: 'that', dots: '2-3-4_1-2-5_1_2-3-4', description: 'Demonstrative pronoun' }
  ];

  // Lessons structure
  const lessons = {
    beginner: [
      { id: 1, title: "Introduction to Braille", chars: brailleCharacters.slice(0, 5) },
      { id: 2, title: "Letters A-H", chars: brailleCharacters.slice(0, 8) },
      { id: 3, title: "Letters I-P", chars: brailleCharacters.slice(8, 16) },
      { id: 4, title: "Letters Q-Z", chars: brailleCharacters.slice(16) },
      { id: 5, title: "Full Alphabet", chars: brailleCharacters }
    ],
    intermediate: [
      { id: 1, title: "Numbers 0-5", chars: brailleNumbers.slice(0, 6) },
      { id: 2, title: "Numbers 6-9", chars: brailleNumbers.slice(6, 10) },
      { id: 3, title: "All Numbers", chars: brailleNumbers }
    ],
    advanced: [
      { id: 1, title: "Common Words", chars: brailleWords.slice(0, 3) },
      { id: 2, title: "More Common Words", chars: brailleWords.slice(3) },
      { id: 3, title: "All Words", chars: brailleWords }
    ]
  };

  const currentLessonData = lessons[selectedLevel]?.find(l => l.id === currentLesson) || lessons[selectedLevel]?.[0];

  const handleNextLesson = () => {
    const currentLevelLessons = lessons[selectedLevel];
    if (currentLessonData && currentLesson < currentLevelLessons.length) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const totalLessons = lessons[selectedLevel]?.length || 0;
  const progressPercentage = (currentLesson / totalLessons) * 100;

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
            <LessonSelector 
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              currentLesson={currentLesson}
              setCurrentLesson={setCurrentLesson}
              progressPercentage={progressPercentage}
              totalLessons={totalLessons}
              lessons={lessons}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {currentLessonData?.title || "Lesson"}
              </h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-2 rounded-lg ${activeTab === 'learn' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('learn')}
                >
                  Learn
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg ${activeTab === 'practice' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('practice')}
                >
                  Practice
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg ${activeTab === 'quiz' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('quiz')}
                >
                  Quiz
                </button>
              </div>
            </div>

            {activeTab === 'learn' && (
              <BrailleCharacterDisplay 
                characters={currentLessonData?.chars || brailleCharacters} 
                selectedChar={selectedChar}
                setSelectedChar={setSelectedChar}
              />
            )}
            
            {activeTab === 'practice' && (
              <BraillePracticeArea 
                selectedChar={selectedChar || (currentLessonData?.chars && currentLessonData.chars[0])} 
              />
            )}
            
            {activeTab === 'quiz' && (
              <QuizSection 
                characters={currentLessonData?.chars || brailleCharacters}
              />
            )}

            <div className="mt-8 flex justify-between">
              <button
                className="py-2 px-4 flex items-center gap-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={handlePreviousLesson}
                disabled={currentLesson === 1}
              >
                <ArrowLeft className="w-4 h-4" /> Previous Lesson
              </button>
              <button
                className="py-2 px-4 flex items-center gap-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                onClick={handleNextLesson}
                disabled={currentLesson === totalLessons}
              >
                Next Lesson <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <GraduationCap className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Video tutorials</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Practice exercises</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Downloadable materials</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <Award className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Complete lessons</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Practice streak</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Mastery badges</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <BookOpen className="w-8 h-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Additional Tools</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Braille translator</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Reference guide</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-yellow-600" /> Progress tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrailleLearning;
