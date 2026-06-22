import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Lazy loading des pages pour optimiser le chargement initial
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PlayerJoinPage = lazy(() => import('./pages/PlayerJoinPage').then(m => ({ default: m.PlayerJoinPage })));
const QuizForm = lazy(() => import('./pages/QuizForm').then(m => ({ default: m.QuizForm })));
const CreateSession = lazy(() => import('./pages/CreateSession').then(m => ({ default: m.CreateSession })));
const MasterGame = lazy(() => import('./pages/MasterGame').then(m => ({ default: m.MasterGame })));
const PlayerGame = lazy(() => import('./pages/PlayerGame').then(m => ({ default: m.PlayerGame })));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(m => ({ default: m.ResultsPage })));

// Composant de chargement pour le Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white text-xl font-bold">Chargement...</p>
    </div>
  </div>
);

// Composant pour protéger les routes admin
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
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
          
          {/* Écran maître pour le host (protégé) */}
          <Route
            path="/admin/game/:sessionId"
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
