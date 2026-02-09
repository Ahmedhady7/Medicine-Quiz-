
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'True/False',
  MIXED = 'Mixed'
}

export enum AppLanguage {
  EN = 'en',
  AR = 'ar'
}

export enum QuizTargetLanguage {
  SOURCE = 'Source',
  EN = 'English',
  AR = 'Arabic'
}

export interface Question {
  id: string;
  type: 'MCQ' | 'TF';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizSession {
  id: string;
  title: string;
  subjectId: string;
  chapterId: string;
  difficulty: Difficulty;
  questions: Question[];
  createdAt: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  total: number;
  timeSpent: number;
  date: number;
  userAnswers: Record<string, string>;
}

export interface Chapter {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface AppState {
  subjects: Subject[];
  results: QuizResult[];
  quizzes: QuizSession[];
  uiLanguage: AppLanguage;
}
