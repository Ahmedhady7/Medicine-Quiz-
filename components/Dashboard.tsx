
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppState, QuizSession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  t: any;
  onImport: (code: string) => boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, t, onImport }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState(false);

  const recentQuizzes = state.quizzes.slice(0, 5);
  const lastResults = state.results.slice(-7).map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    score: Math.round((r.score / r.total) * 100)
  }));

  const totalQuestionsAnswered = state.results.reduce((acc, curr) => acc + curr.total, 0);
  const avgScore = state.results.length 
    ? Math.round(state.results.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / state.results.length * 100) 
    : 0;

  const handleShareQuiz = async (quiz: QuizSession) => {
    try {
      // Use encodeURIComponent to handle Unicode (Arabic) before btoa
      const data = btoa(encodeURIComponent(JSON.stringify(quiz)));
      
      // Ensure absolute URL construction
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
      const pathname = window.location.pathname.startsWith('/') ? window.location.pathname : '/' + window.location.pathname;
      const url = `${origin}${pathname}?import=${encodeURIComponent(data)}#/`;
      
      if (navigator.share) {
        await navigator.share({ 
          title: quiz.title, 
          text: `${t.appName}: ${quiz.title}`, 
          url: url 
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Quiz link copied to clipboard!');
      }
    } catch (err) {
      console.error("Share failed", err);
      // Fallback if URL is too long or another issue occurs
      alert("Sharing failed. The quiz might be too large to share via URL.");
    }
  };

  const handleImportSubmit = () => {
    if (onImport(importCode)) {
      setIsImportModalOpen(false);
      setImportCode('');
      setImportError(false);
      alert(t.quizImported);
    } else {
      setImportError(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-scaleUp">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.importQuiz}</h3>
            <p className="text-sm text-slate-500 mb-6">{t.importPrompt}</p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className={`w-full h-32 bg-slate-50 border ${importError ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
              placeholder="Paste the Base64 code here..."
            />
            {importError && <p className="text-red-500 text-xs mt-2 font-medium">{t.invalidCode}</p>}
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {setIsImportModalOpen(false); setImportError(false);}}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleImportSubmit}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                {t.importAction}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t.welcome}</h1>
          <p className="text-slate-500 mt-1">{t.ready}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-file-import text-blue-600"></i>
            <span>{t.importQuiz}</span>
          </button>
          <Link to="/generate" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i>
            <span>{t.createNew}</span>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
            <i className="fas fa-vial text-2xl"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t.quizzesTaken}</p>
            <p className="text-2xl font-bold text-slate-800">{state.results.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-xl">
            <i className="fas fa-check-double text-2xl"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t.avgAccuracy}</p>
            <p className="text-2xl font-bold text-slate-800">{avgScore}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-xl">
            <i className="fas fa-question-circle text-2xl"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t.totalAnswered}</p>
            <p className="text-2xl font-bold text-slate-800">{totalQuestionsAnswered}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-history text-blue-500"></i>
            {t.recentQuizzes}
          </h2>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-4">
              {recentQuizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><i className="fas fa-layer-group"></i> {quiz.questions.length} Questions</span>
                      <span className="flex items-center gap-1"><i className="fas fa-signal"></i> {quiz.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleShareQuiz(quiz)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-2"
                      title={t.shareQuiz}
                    >
                      <i className="fas fa-share-nodes"></i>
                    </button>
                    <Link to={`/quiz/${quiz.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap">
                      {t.start} <i className={`fas fa-arrow-${state.uiLanguage === 'ar' ? 'left' : 'right'} ml-1`}></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <i className="fas fa-box-open text-4xl mb-4"></i>
              <p>{t.noQuizzes}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-area text-blue-500"></i>
            {t.performanceTrend}
          </h2>
          <div className="h-[250px] w-full">
            {lastResults.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastResults}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} orientation={state.uiLanguage === 'ar' ? 'right' : 'left'} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>Complete at least 2 quizzes to see your trend</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
