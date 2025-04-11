
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizSectionProps {
  characters: Array<{
    symbol: string;
    letter: string;
    dots: string;
  }>;
}

const QuizSection = ({ characters }: QuizSectionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  // Generate a random order of characters for the quiz
  useEffect(() => {
    if (!characters || characters.length === 0) return;
    
    // Create quiz questions
    const questions = [];
    const usedChars = new Set();
    
    // Generate questions for all available characters
    const shuffledChars = [...characters].sort(() => Math.random() - 0.5);
    
    for (const char of shuffledChars) {
      if (usedChars.has(char.letter)) continue;
      usedChars.add(char.letter);
      
      // Generate options (one correct answer and 3 incorrect ones)
      let options = [char.letter];
      
      while (options.length < 4) {
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        if (!options.includes(randomChar.letter) && randomChar.letter !== char.letter) {
          options.push(randomChar.letter);
        }
      }
      
      // Shuffle options
      options = options.sort(() => Math.random() - 0.5);
      
      questions.push({
        symbol: char.symbol,
        correctAnswer: char.letter,
        options: options
      });
    }
    
    setQuizQuestions(questions);
  }, [characters]);

  const handleAnswerClick = (answer: string) => {
    const correct = answer === quizQuestions[currentQuestion].correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };
  
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    // Shuffle questions again
    setQuizQuestions([...quizQuestions].sort(() => Math.random() - 0.5));
  };

  if (quizQuestions.length === 0) {
    return <div className="p-8 text-center">Loading quiz questions...</div>;
  }
  
  if (showResult) {
    return (
      <div className="text-center p-8">
        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
        <p className="text-lg mb-6">
          Your score: <span className="text-yellow-700 font-bold">{score}</span> out of {quizQuestions.length}
        </p>
        <div className="mb-8">
          {score === quizQuestions.length ? (
            <p className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" /> Perfect score! Excellent job!
            </p>
          ) : score >= quizQuestions.length / 2 ? (
            <p className="text-yellow-600">Good job! Keep practicing to improve.</p>
          ) : (
            <p className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" /> You need more practice with these characters.
            </p>
          )}
        </div>
        <button
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          onClick={restartQuiz}
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-lg font-medium">Question {currentQuestion + 1}/{quizQuestions.length}</p>
        <p className="text-lg">Score: <span className="font-bold">{score}</span></p>
      </div>
      
      <div className="p-8 bg-gray-50 rounded-lg mb-8 text-center">
        <h3 className="text-xl mb-4">What letter does this Braille character represent?</h3>
        <p className="text-7xl mb-8">{quizQuestions[currentQuestion].symbol}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {quizQuestions[currentQuestion].options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg text-lg font-medium ${
                selectedAnswer === option 
                  ? (isCorrect ? 'bg-green-100 border-2 border-green-600' : 'bg-red-100 border-2 border-red-600')
                  : 'bg-white border-2 border-gray-300 hover:bg-yellow-50 hover:border-yellow-600'
              }`}
            >
              {option.toUpperCase()}
              {selectedAnswer === option && isCorrect && <CheckCircle className="inline ml-2 text-green-600 w-5 h-5" />}
              {selectedAnswer === option && !isCorrect && <XCircle className="inline ml-2 text-red-600 w-5 h-5" />}
            </button>
          ))}
        </div>
      </div>
      
      {selectedAnswer && (
        <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {isCorrect ? (
            <p className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Correct! This is the letter {quizQuestions[currentQuestion].correctAnswer.toUpperCase()}.
            </p>
          ) : (
            <p className="flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Incorrect. The correct answer is {quizQuestions[currentQuestion].correctAnswer.toUpperCase()}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizSection;
