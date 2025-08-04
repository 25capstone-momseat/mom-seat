import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // ✔ 한 줄로 통합
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import OCR from './pages/OCR';
import SeatReservation from './pages/SeatReservation';
import Navbar from './components/Navbar'; // ✅ Navbar import 누락되어 있으면 추가

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/ocr" element={<OCR />} />
          <Route
            path="/seat-reservation"
            element={
              <PrivateRoute>
                <SeatReservation />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} /> {/* 잘못된 경로 대응 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;