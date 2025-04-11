
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface BraillePracticeAreaProps {
  selectedChar: {
    symbol: string;
    letter: string;
    dots: string;
  };
}

const BraillePracticeArea = ({ selectedChar }: BraillePracticeAreaProps) => {
  const [pressedDots, setPressedDots] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{message: string, correct: boolean} | null>(null);
  
  // Reset pressed dots when character changes
  useEffect(() => {
    setPressedDots([]);
    setFeedback(null);
  }, [selectedChar]);

  const toggleDot = (dot: string) => {
    if (pressedDots.includes(dot)) {
      setPressedDots(pressedDots.filter(d => d !== dot));
    } else {
      setPressedDots([...pressedDots, dot]);
    }
    setFeedback(null);
  };

  const checkAnswer = () => {
    const expectedDots = selectedChar.dots.split('-').sort();
    const currentDots = [...pressedDots].sort();
    
    const isCorrect = 
      expectedDots.length === currentDots.length && 
      expectedDots.every((dot, index) => dot === currentDots[index]);
    
    if (isCorrect) {
      setFeedback({
        message: `Correct! You've written "${selectedChar.letter.toUpperCase()}" in braille.`,
        correct: true
      });
    } else {
      setFeedback({
        message: `Not quite. The correct dots for "${selectedChar.letter.toUpperCase()}" are ${selectedChar.dots}.`,
        correct: false
      });
    }
  };

  const resetPractice = () => {
    setPressedDots([]);
    setFeedback(null);
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-6 text-center">Practice Writing "{selectedChar.letter.toUpperCase()}" in Braille</h3>
      
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-40 h-60 bg-white border-2 border-gray-300 rounded-lg mb-8 flex items-center justify-center">
          {/* Braille cell with dots in a 2x3 grid layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Dot 1 - Top Left */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('1') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('1')}
            >
              1
            </button>
            
            {/* Dot 4 - Top Right */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('4') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('4')}
            >
              4
            </button>
            
            {/* Dot 2 - Middle Left */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('2') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('2')}
            >
              2
            </button>
            
            {/* Dot 5 - Middle Right */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('5') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('5')}
            >
              5
            </button>
            
            {/* Dot 3 - Bottom Left */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('3') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('3')}
            >
              3
            </button>
            
            {/* Dot 6 - Bottom Right */}
            <button
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center 
              ${pressedDots.includes('6') ? 'bg-yellow-600 border-yellow-700' : 'bg-white border-gray-400 hover:bg-yellow-50'}`}
              onClick={() => toggleDot('6')}
            >
              6
            </button>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            onClick={checkAnswer}
          >
            Check Answer
          </button>
          <button
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={resetPractice}
          >
            Reset
          </button>
        </div>
      </div>
      
      {feedback && (
        <div className={`mt-6 p-4 rounded-lg flex items-center gap-3
          ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {feedback.correct ? 
            <CheckCircle className="w-6 h-6 text-green-600" /> : 
            <XCircle className="w-6 h-6 text-red-600" />
          }
          <p>{feedback.message}</p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">How to Practice:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Look at the letter you're practicing: <span className="font-bold">{selectedChar.letter.toUpperCase()}</span></li>
          <li>Press the dots on the Braille cell that correspond to this letter</li>
          <li>For this letter, you should press dots: <span className="font-bold">{selectedChar.dots}</span></li>
          <li>Click "Check Answer" to see if you're correct</li>
        </ol>
      </div>
    </div>
  );
};

export default BraillePracticeArea;
