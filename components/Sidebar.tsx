
import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Subject, AppLanguage } from '../types';

interface SidebarProps {
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onAddChapter: (subjectId: string, name: string) => void;
  lang: AppLanguage;
  onSetLang: (lang: AppLanguage) => void;
  t: any;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  subjects, 
  onAddSubject, 
  onAddChapter, 
  lang, 
  onSetLang, 
  t,
  onExportData,
  onImportData
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName('');
      setShowSubjectInput(false);
    }
  };

  const isRTL = lang === AppLanguage.AR;

  const handleShareApp = async () => {
    try {
      const shareUrl = window.location.origin + window.location.pathname + window.location.hash;
      if (navigator.share) {
        await navigator.share({ 
          title: t.appName, 
          text: t.ready, 
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <aside className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-full w-64 bg-slate-900 text-slate-100 p-4 hidden lg:flex flex-col shadow-xl z-50`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-blue-500 p-2 rounded-lg">
          <i className="fas fa-stethoscope text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">{t.appName}</h1>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <div className="space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-home"></i>
            <span>{t.dashboard}</span>
          </Link>
          <Link to="/generate" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/generate' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-plus-circle"></i>
            <span>{t.createQuiz}</span>
          </Link>
          <Link to="/stats" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/stats' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-chart-line"></i>
            <span>{t.myStats}</span>
          </Link>
        </div>

        <div>
          <div className="flex justify-between items-center px-3 mb-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>{t.subjects}</span>
            <button onClick={() => setShowSubjectInput(!showSubjectInput)} className="hover:text-blue-400">
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {showSubjectInput && (
            <form onSubmit={handleAddSubject} className="px-3 mb-4">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="..."
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </form>
          )}

          <div className="space-y-1">
            {subjects.map(subject => (
              <div key={subject.id} className="group">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer group-hover:bg-slate-800 rounded-lg">
                  <i className="fas fa-book-medical text-xs text-blue-500"></i>
                  <span>{subject.name}</span>
                </div>
                {subject.chapters.length > 0 && (
                  <div className={`${isRTL ? 'mr-8' : 'ml-8'} space-y-1 mt-1 border-${isRTL ? 'r' : 'l'} border-slate-800`}>
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className="px-3 py-1 text-xs text-slate-500 hover:text-blue-400 cursor-pointer">
                        {chapter.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
        {/* Language Toggles */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <button 
              onClick={() => onSetLang(AppLanguage.EN)}
              className={`flex-1 px-2 py-2 text-[10px] rounded-lg font-bold transition-all border ${lang === AppLanguage.EN ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100'}`}
            >
              English
            </button>
            <button 
              onClick={() => onSetLang(AppLanguage.AR)}
              className={`flex-1 px-2 py-2 text-[10px] rounded-lg font-bold transition-all border ${lang === AppLanguage.AR ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100'}`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Data Management (Save/Restore) */}
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={onExportData}
            className="flex items-center gap-2.5 px-3 py-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <i className="fas fa-download text-blue-400"></i>
            <span>{t.saveData}</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 px-3 py-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <i className="fas fa-upload text-amber-400"></i>
            <span>{t.restoreData}</span>
            <input type="file" ref={fileInputRef} onChange={onImportData} accept=".json" className="hidden" />
          </button>
        </div>

        <button 
          onClick={handleShareApp}
          className="flex items-center justify-center gap-3 px-3 py-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          <i className="fas fa-share-alt"></i>
          <span>{t.shareApp}</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
          <i className="fas fa-check-circle text-emerald-500"></i>
          {t.autoSaved}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
