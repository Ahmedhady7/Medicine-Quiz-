
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject, Difficulty, QuestionType, QuizSession, QuizTargetLanguage } from '../types';
import { generateQuestionsFromText } from '../services/gemini';

interface QuizGeneratorProps {
  subjects: Subject[];
  onQuizGenerated: (quiz: QuizSession) => void;
  t: any;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ subjects, onQuizGenerated, t }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState('');
  
  const [config, setConfig] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    chapterId: subjects[0]?.chapters[0]?.id || '',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MIXED,
    count: 20,
    mcqRatio: 70,
    targetLanguage: QuizTargetLanguage.SOURCE
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    setFiles(prev => [...prev, ...selectedFiles]);
    
    let fullText = '';
    for (const file of selectedFiles) {
      const text = await file.text();
      fullText += `\n--- SOURCE: ${file.name} ---\n${text}`;
    }
    setExtractedText(prev => prev + fullText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedText.trim() && files.length === 0) {
      setError('Please upload at least one file or provide text.');
      return;
    }
    if (!config.title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const questions = await generateQuestionsFromText(
        extractedText.slice(0, 30000), 
        config.count,
        config.difficulty,
        config.type,
        config.mcqRatio,
        config.targetLanguage
      );

      const newQuiz: QuizSession = {
        id: Date.now().toString(),
        title: config.title,
        subjectId: config.subjectId,
        chapterId: config.chapterId,
        difficulty: config.difficulty,
        questions,
        createdAt: Date.now()
      };

      onQuizGenerated(newQuiz);
      navigate(`/quiz/${newQuiz.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during generation.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === config.subjectId);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">{t.quizArchitect}</h1>
          <p className="opacity-90 mt-1">{t.uploadDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-file-upload text-blue-500"></i>
              {t.studyMaterial}
            </h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept=".txt,.md,.json" 
              />
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                <i className="fas fa-cloud-upload-alt text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700">{t.clickUpload}</p>
                <p className="text-xs text-slate-400 mt-1">{t.supports}</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2">
                    <i className="fas fa-file-alt"></i>
                    {file.name}
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-cog text-blue-500"></i>
                {t.configuration}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t.quizTitle}</label>
                  <input
                    type="text"
                    required
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="e.g. Finals Prep"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.subject}</label>
                    <select
                      value={config.subjectId}
                      onChange={(e) => setConfig({ ...config, subjectId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.chapter}</label>
                    <select
                      value={config.chapterId}
                      onChange={(e) => setConfig({ ...config, chapterId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                      {selectedSubject?.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-sliders-h text-blue-500"></i>
                {t.difficulty} & {t.targetLanguage}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.difficulty}</label>
                    <select
                      value={config.difficulty}
                      onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                      <option value={Difficulty.EASY}>{t.easy}</option>
                      <option value={Difficulty.MEDIUM}>{t.medium}</option>
                      <option value={Difficulty.HARD}>{t.hard}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.targetLanguage}</label>
                    <select
                      value={config.targetLanguage}
                      onChange={(e) => setConfig({ ...config, targetLanguage: e.target.value as QuizTargetLanguage })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                      <option value={QuizTargetLanguage.SOURCE}>{t.langSource}</option>
                      <option value={QuizTargetLanguage.AR}>{t.langAr}</option>
                      <option value={QuizTargetLanguage.EN}>{t.langEn}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t.questionStyle}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[QuestionType.MCQ, QuestionType.TRUE_FALSE, QuestionType.MIXED].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setConfig({ ...config, type })}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          config.type === type 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {type === QuestionType.MIXED ? t.mixed : type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
              loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                <span>{t.generate}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizGenerator;
