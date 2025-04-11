
import React from 'react';

interface LessonSelectorProps {
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  currentLesson: number;
  setCurrentLesson: (lesson: number) => void;
  progressPercentage: number;
  totalLessons: number;
  lessons: {
    [key: string]: {
      id: number;
      title: string;
      chars: any[];
    }[];
  };
}

const LessonSelector = ({
  selectedLevel,
  setSelectedLevel,
  currentLesson,
  setCurrentLesson,
  progressPercentage,
  totalLessons,
  lessons
}: LessonSelectorProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Learning Path</h2>
      <div className="space-y-4">
        <button
          className={`w-full py-2 px-4 rounded-lg text-left ${
            selectedLevel === 'beginner'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => {
            setSelectedLevel('beginner');
            setCurrentLesson(1);
          }}
        >
          Beginner (Letters)
        </button>
        <button
          className={`w-full py-2 px-4 rounded-lg text-left ${
            selectedLevel === 'intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => {
            setSelectedLevel('intermediate');
            setCurrentLesson(1);
          }}
        >
          Intermediate (Numbers)
        </button>
        <button
          className={`w-full py-2 px-4 rounded-lg text-left ${
            selectedLevel === 'advanced'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => {
            setSelectedLevel('advanced');
            setCurrentLesson(1);
          }}
        >
          Advanced (Words)
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-yellow-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Lesson {currentLesson} of {totalLessons}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Lesson Plan</h3>
        <div className="space-y-2">
          {lessons[selectedLevel]?.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson.id)}
              className={`w-full text-left p-2 rounded ${
                currentLesson === lesson.id
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {lesson.id}. {lesson.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default LessonSelector;
