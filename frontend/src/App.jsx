// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubwayDashboard from './pages/SubwayDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OCR from './pages/OCR';
import ReservationMenu from './pages/ReservationMenu';
import SeatReservation from './pages/SeatReservation';
import SeatSearch from './pages/SeatSearch';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<Home />} />
              <Route path="/subway" element={<SubwayDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/ocr" element={<OCR />} />

              {/* 예약 관련 */}
              <Route path="/reservation" element={<ReservationMenu />} />
              <Route path="/reservation/seats" element={<SeatReservation />} />
              <Route path="/search" element={<SeatSearch />} />

              {/* 잘못된 경로 리다이렉트 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
