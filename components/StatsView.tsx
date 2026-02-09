
import React from 'react';
import { QuizResult, QuizSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsViewProps {
  results: QuizResult[];
  quizzes: QuizSession[];
  t: any;
}

const StatsView: React.FC<StatsViewProps> = ({ results, quizzes, t }) => {
  const getQuizTitle = (quizId: string) => quizzes.find(q => q.id === quizId)?.title || 'Unknown Quiz';

  const chartData = results.slice(-10).map(r => ({
    name: getQuizTitle(r.quizId).substring(0, 10) + '...',
    accuracy: Math.round((r.score / r.total) * 100),
    fullName: getQuizTitle(r.quizId)
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">{t.progress}</h1>
        <p className="text-slate-500">{t.ready}</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-chart-bar text-blue-500"></i>
          {t.perSession}
        </h2>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  labelFormatter={(v, items) => items[0]?.payload?.fullName}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              {t.noRecords}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{t.history}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t.quizTitle}</th>
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.score}</th>
                <th className="px-6 py-4">{t.accuracy}</th>
                <th className="px-6 py-4">{t.time}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.slice().reverse().map(result => (
                <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{getQuizTitle(result.quizId)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(result.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{result.score}</span>
                    <span className="text-slate-400">/{result.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (result.score/result.total) >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{width: `${(result.score/result.total) * 100}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {Math.round((result.score/result.total) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {Math.round(result.timeSpent / 1000 / 60)}m {Math.round((result.timeSpent / 1000) % 60)}s
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {t.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
