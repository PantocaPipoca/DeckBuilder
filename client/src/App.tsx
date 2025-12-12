// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DecksPage from './pages/DecksPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DecksPage />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/login" element={<div>Login Page (TODO)</div>} />
      </Routes>
    </Router>
  );
}

export default App;