import { create } from 'zustand';

export interface Player {
  id: string;
  nickname: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  isConnected: boolean;
  team?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface Session {
  id: string;
  inviteCode: string;
  status: 'waiting' | 'playing' | 'finished';
  currentQ: number;
  quiz: {
    id: string;
    title: string;
    theme: string;
    questions: any[];
  };
  players: Player[];
  teams?: any[];
}

interface SessionState {
  session: Session | null;
  currentPlayer: Player | null;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  updatePlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  currentPlayer: null,
  loading: false,
  error: null,

  setSession: (session) => set({ session }),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  updatePlayers: (players) => set((state) => ({
    session: state.session ? { ...state.session, players } : null,
  })),
  
  addPlayer: (player) => set((state) => ({
    session: state.session 
      ? { ...state.session, players: [...state.session.players, player] }
      : null,
  })),
  
  removePlayer: (playerId) => set((state) => ({
    session: state.session
      ? {
          ...state.session,
          players: state.session.players.filter((p) => p.id !== playerId),
        }
      : null,
  })),
  
  updatePlayerScore: (playerId, score) => set((state) => ({
    session: state.session
      ? {
          ...state.session,
          players: state.session.players.map((p) =>
            p.id === playerId ? { ...p, score } : p
          ),
        }
      : null,
  })),
}));
