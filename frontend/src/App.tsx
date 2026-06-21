import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardPage } from './pages/DashboardPage';
import { PlayerJoinPage } from './pages/PlayerJoinPage';
import { QuizForm } from './pages/QuizForm';
import { CreateSession } from './pages/CreateSession';
import { MasterGame } from './pages/MasterGame';
import { PlayerGame } from './pages/PlayerGame';
import { MediaLibrary } from './pages/MediaLibrary';
import { ResultsPage } from './pages/ResultsPage';

// Composant pour protéger les routes admin
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Pas de checkAuth automatique - l'authentification sera vérifiée
  // uniquement lors de l'accès aux routes protégées

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
        
        {/* Tableau de bord statistiques (protégé) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
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
        
        {/* Médiathèque (protégé) */}
        <Route
          path="/admin/media"
          element={
            <ProtectedRoute>
              <MediaLibrary />
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
        
        {/* Page de résultats */}
        <Route path="/results/:sessionId" element={<ResultsPage />} />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
