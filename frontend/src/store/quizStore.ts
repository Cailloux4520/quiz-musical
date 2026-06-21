import { create } from 'zustand';

export interface Question {
  id: string;
  order: number;
  type: string;
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  choices: string[];
  correctIndex: number;
  timeLimit: number;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  theme: string;
  questionsCount?: number;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
  setQuizzes: (quizzes: Quiz[]) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,

  setQuizzes: (quizzes) => set({ quizzes }),
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  
  addQuiz: (quiz) => set((state) => ({ 
    quizzes: [...state.quizzes, quiz] 
  })),
  
  updateQuiz: (quiz) => set((state) => ({ 
    quizzes: state.quizzes.map((q) => q.id === quiz.id ? quiz : q) 
  })),
  
  deleteQuiz: (id) => set((state) => ({ 
    quizzes: state.quizzes.filter((q) => q.id !== id) 
  })),
}));
