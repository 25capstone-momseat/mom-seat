// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SubwayProvider } from './contexts/SubwayContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubwayDashboard from './pages/SubwayDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OCR from './pages/OCR';
import ReservationMenu from './pages/ReservationMenu';
import SeatReservation from './pages/SeatReservation';
import SeatSearch from './pages/SeatSearch';
import ReservationHistory from './pages/ReservationHistory';

import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <SubwayProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/subway" element={<SubwayDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/ocr" element={<OCR />} />

              {/* 예약 관련 */}
              <Route path="/reservation" element={<ReservationMenu />} />
              <Route path="/reservation/seats" element={<SeatReservation />} />
              <Route path="/reservation-history" element={<ReservationHistory />} />
              <Route path="/seat-search" element={<SeatSearch />} />

              {/* 내 정보 관리 */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/password" element={<ChangePassword />} />
              <Route path="/reset-password" element={<ResetPassword />} /> 
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SubwayProvider>
  );
}

export default App;
