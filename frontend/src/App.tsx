import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PlayerJoinPage } from './pages/PlayerJoinPage';
import { QuizForm } from './pages/QuizForm';
import { CreateSession } from './pages/CreateSession';
import { MasterGame } from './pages/MasterGame';
import { PlayerGame } from './pages/PlayerGame';

// Composant pour protéger les routes admin
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Pendant le chargement, afficher un spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Vérifier l'authentification au chargement une seule fois
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tableau vide pour n'exécuter qu'au montage initial

  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<HomePage />} />
        
        {/* Login admin */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard admin (protégé) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Créer un nouveau quiz (protégé) */}
        <Route
          path="/admin/quiz/new"
          element={
            <ProtectedRoute>
              <QuizForm />
            </ProtectedRoute>
          }
        />
        
        {/* Éditer un quiz (protégé) */}
        <Route
          path="/admin/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizForm />
            </ProtectedRoute>
          }
        />
        
        {/* Créer une session (protégé) */}
        <Route
          path="/admin/session/new/:quizId"
          element={
            <ProtectedRoute>
              <CreateSession />
            </ProtectedRoute>
          }
        />
        
        {/* Écran maître de jeu (protégé) */}
        <Route
          path="/master/:sessionId"
          element={
            <ProtectedRoute>
              <MasterGame />
            </ProtectedRoute>
          }
        />
        
        {/* Page de rejoindre une partie */}
        <Route path="/join" element={<PlayerJoinPage />} />
        <Route path="/join/:inviteCode" element={<PlayerJoinPage />} />
        
        {/* Écran de jeu pour les joueurs */}
        <Route path="/play/:inviteCode" element={<PlayerGame />} />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
