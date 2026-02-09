
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Subject, 
  AppState, 
  AppLanguage,
  QuizSession, 
  QuizResult 
} from './types';
import Dashboard from './components/Dashboard';
import QuizGenerator from './components/QuizGenerator';
import QuizRunner from './components/QuizRunner';
import StatsView from './components/StatsView';
import Sidebar from './components/Sidebar';
import { locales } from './locales';

const STORAGE_KEY = 'medicine_quiz_app_state_v2';

const Header: React.FC<{ lang: AppLanguage, onSetLang: (l: AppLanguage) => void, t: any }> = ({ lang, onSetLang, t }) => {
  const isRTL = lang === AppLanguage.AR;
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: t.appName, 
          text: t.ready, 
          url: window.location.origin + window.location.pathname + window.location.hash 
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 mb-6 flex items-center justify-between lg:hidden">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <i className="fas fa-stethoscope"></i>
        </div>
        <span className="font-bold text-slate-800 text-lg">{t.appName}</span>
      </Link>
      
      <div className="flex items-center gap-2">
        <div className="bg-slate-100 p-1 rounded-lg flex">
          <button 
            onClick={() => onSetLang(AppLanguage.EN)}
            className={`px-2 py-1 text-[10px] rounded-md font-bold transition-all ${lang === AppLanguage.EN ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            EN
          </button>
          <button 
            onClick={() => onSetLang(AppLanguage.AR)}
            className={`px-2 py-1 text-[10px] rounded-md font-bold transition-all ${lang === AppLanguage.AR ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            AR
          </button>
        </div>
        <button 
          onClick={handleShare}
          className="bg-blue-50 text-blue-600 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
        >
          <i className="fas fa-share-alt"></i>
        </button>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      subjects: [
        { id: '1', name: 'Anatomy', chapters: [{ id: '1-1', name: 'Muscular System' }, { id: '1-2', name: 'Skeletal System' }] },
        { id: '2', name: 'Pharmacology', chapters: [{ id: '2-1', name: 'Antibiotics' }] }
      ],
      results: [],
      quizzes: [],
      uiLanguage: AppLanguage.EN
    };
  });

  const t = locales[state.uiLanguage];
  const isRTL = state.uiLanguage === AppLanguage.AR;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = state.uiLanguage;
  }, [state, isRTL]);

  // Handle Quiz Import via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importData = params.get('import');
    if (importData) {
      try {
        // Handle potential base64 issues and decode Unicode
        const decodedQuiz = JSON.parse(decodeURIComponent(atob(importData)));
        decodedQuiz.id = 'imported-' + Date.now();
        saveQuiz(decodedQuiz);
        alert(t.quizImported);
        // Clear URL params safely
        const newUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.error("Import failed", e);
      }
    }
  }, [t.quizImported]);

  const setLanguage = (lang: AppLanguage) => {
    setState(prev => ({ ...prev, uiLanguage: lang }));
  };

  const addSubject = (name: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      chapters: []
    };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  };

  const addChapter = (subjectId: string, name: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId 
          ? { ...s, chapters: [...s.chapters, { id: `${s.id}-${Date.now()}`, name }] }
          : s
      )
    }));
  };

  const saveQuiz = (quiz: QuizSession) => {
    setState(prev => ({ ...prev, quizzes: [quiz, ...prev.quizzes] }));
  };

  const saveResult = (result: QuizResult) => {
    setState(prev => ({ ...prev, results: [result, ...prev.results] }));
  };

  const importQuizByCode = (code: string) => {
    try {
      const decodedQuiz = JSON.parse(decodeURIComponent(atob(code)));
      decodedQuiz.id = 'imported-' + Date.now();
      saveQuiz(decodedQuiz);
      return true;
    } catch (e) {
      return false;
    }
  };

  const exportAllData = () => {
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `medicine_quiz_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    alert(t.dataSaved);
  };

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm(t.confirmRestore)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedState = JSON.parse(content);
        if (importedState.subjects && importedState.quizzes) {
          setState(importedState);
          alert(t.dataRestored);
        } else {
          alert(t.invalidCode);
        }
      } catch (err) {
        alert(t.invalidCode);
      }
    };
    reader.readAsText(file);
  };

  return (
    <HashRouter>
      <div className={`flex min-h-screen bg-slate-50 ${isRTL ? 'font-arabic' : ''}`}>
        <Sidebar 
          subjects={state.subjects} 
          onAddSubject={addSubject} 
          onAddChapter={addChapter} 
          lang={state.uiLanguage}
          onSetLang={setLanguage}
          t={t}
          onExportData={exportAllData}
          onImportData={importAllData}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isRTL ? 'lg:mr-64 mr-0' : 'lg:ml-64 ml-0'}`}>
          <Header lang={state.uiLanguage} onSetLang={setLanguage} t={t} />
          
          <main className="flex-1 p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard state={state} t={t} onImport={importQuizByCode} />} />
              <Route path="/generate" element={<QuizGenerator subjects={state.subjects} onQuizGenerated={saveQuiz} t={t} />} />
              <Route path="/quiz/:quizId" element={<QuizRunner quizzes={state.quizzes} onComplete={saveResult} t={t} lang={state.uiLanguage} />} />
              <Route path="/stats" element={<StatsView results={state.results} quizzes={state.quizzes} t={t} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
