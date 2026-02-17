import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GenerationPage from './pages/GenerationPage';
import CarouselPage from './pages/CarouselPage';
import MotionPosterPage from './pages/MotionPosterPage';
import PublishPage from './pages/PublishPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/generate" element={<GenerationPage />} />
        <Route path="/carousel" element={<CarouselPage />} />
        <Route path="/motion" element={<MotionPosterPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/generate" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
