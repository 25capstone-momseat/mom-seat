// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
// import { AuthProvider } from './contexts/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import Login from './pages/Login';
// import SignUp from './pages/SignUp';
// import Home from './pages/Home';
// import OCR from './pages/OCR';
// import SeatReservation from './pages/SeatReservation';
// import ReservationMenu from './pages/ReservationMenu';
// import SeatSearch from './pages/SeatSearch';
// import Navbar from './components/Navbar';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Navbar />
//         <Routes>
//           {/* 공개 라우트 */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<SignUp />} />
          
//           {/* 인증이 필요한 라우트 (PrivateRoute로 보호) */}
//           <Route element={<PrivateRoute />}>
//             <Route path="/ocr" element={<OCR />} />
//             <Route path="/seat-reservation" element={<ReservationMenu />} />
//             <Route path="/seat-reservation/new" element={<SeatReservation />} />
//             <Route path="/seat-reservation/seat-search" element={<SeatSearch />} />
//             <Route path="/seat-reservation/confirm" element={<div>예약 확인 페이지</div>} />
//             <Route path="/seat-reservation/cancel" element={<div>예약 취소 페이지</div>} />
//           </Route>
          
//           {/* 잘못된 경로는 홈으로 리다이렉트 */}
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';

// 컴포넌트 imports
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



function App() {
  return (
    <AppProvider>
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
              <Route path="/reservation" element={<ReservationMenu />} />
              <Route path="/reservation/seats" element={<SeatReservation />} />
              <Route path="/reservation-history" element={<ReservationHistory />} />
              <Route path="/seat-search" element={<SeatSearch />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;