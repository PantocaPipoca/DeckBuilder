// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider as Auth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DecksPage from './pages/DecksPage';
import SocialPage from './pages/SocialPage';
import SharedDeckPage from './pages/SharedDeckPage';
import './styles/global.css';

function App() {
  return (
    <Auth>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Public shared deck route */}
          <Route path="/deck/:userId/:deckId" element={<SharedDeckPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/decks" 
            element={
              <ProtectedRoute>
                <DecksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/social" 
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Auth>
  );
}

export default App;