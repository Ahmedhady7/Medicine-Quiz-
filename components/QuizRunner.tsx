
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizSession, QuizResult, AppLanguage } from '../types';

interface QuizRunnerProps {
  quizzes: QuizSession[];
  onComplete: (result: QuizResult) => void;
  t: any;
  lang: AppLanguage;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ quizzes, onComplete, t, lang }) => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const quiz = quizzes.find(q => q.id === quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);

  const isRTL = lang === AppLanguage.AR;

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Quiz not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600">Return to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = quiz.questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      id: Date.now().toString(),
      quizId: quiz.id,
      score,
      total: quiz.questions.length,
      timeSpent: Date.now() - startTime,
      date: Date.now(),
      userAnswers: answers
    };

    onComplete(result);
    setIsFinished(true);
  };

  const handleShareQuiz = async () => {
    if (!quiz) return;
    try {
      const data = btoa(encodeURIComponent(JSON.stringify(quiz)));
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
      const pathname = window.location.pathname.startsWith('/') ? window.location.pathname : '/' + window.location.pathname;
      const url = `${origin}${pathname}?import=${encodeURIComponent(data)}#/`;
      
      if (navigator.share) {
        await navigator.share({ 
          title: quiz.title, 
          text: `Challenge yourself with this medical quiz: ${quiz.title}`, 
          url: url 
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Quiz link copied to clipboard!');
      }
    } catch (err) {
      console.error("Share failed", err);
      alert("Sharing failed. The quiz might be too large to share via URL.");
    }
  };

  if (isFinished) {
    const score = quiz.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 ${
            percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <i className={`fas ${percentage >= 70 ? 'fa-award' : 'fa-graduation-cap'}`}></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.completed}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8 mt-6">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t.score}</p>
              <p className="text-3xl font-bold text-slate-800">{score}/{quiz.questions.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t.accuracy}</p>
              <p className="text-3xl font-bold text-slate-800">{percentage}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleShareQuiz}
              className="w-full bg-blue-100 text-blue-700 py-4 rounded-2xl font-bold hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-share-nodes"></i>
              {t.shareQuiz}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              {t.backDashboard}
            </button>
            <button 
              onClick={() => navigate('/stats')}
              className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              {t.viewStats}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{quiz.title}</h2>
          <p className="text-xs text-slate-500">Question {currentIndex + 1} of {quiz.questions.length}</p>
        </div>
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-red-500 transition-colors">
          <i className="fas fa-times-circle text-xl"></i>
        </button>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">
              {currentQuestion.type}
            </span>
            <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-md">
              {quiz.difficulty}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 leading-relaxed mb-8">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.type === 'MCQ' ? (
              currentQuestion.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showFeedback = showExplanation;

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      showFeedback
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : isSelected
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-slate-100 opacity-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    {showFeedback && isCorrect && <i className="fas fa-check-circle text-emerald-600"></i>}
                    {showFeedback && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600"></i>}
                  </button>
                );
              })
            ) : (
              (isRTL ? ['صح', 'خطأ'] : ['True', 'False']).map((option) => {
                const isSelected = answers[currentQuestion.id] === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showFeedback = showExplanation;

                return (
                  <button
                    key={option}
                    disabled={showExplanation}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      showFeedback
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : isSelected
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-slate-100 opacity-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    {showFeedback && isCorrect && <i className="fas fa-check-circle text-emerald-600"></i>}
                    {showFeedback && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600"></i>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {showExplanation && (
          <div className="bg-slate-50 p-8 border-t border-slate-100 animate-slideUp">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
              <i className="fas fa-info-circle text-blue-500"></i>
              {t.insight}
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
            <button 
              onClick={nextQuestion}
              className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex < quiz.questions.length - 1 ? t.next : t.results}</span>
              <i className={`fas fa-arrow-${isRTL ? 'left' : 'right'} text-xs`}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizRunner;
