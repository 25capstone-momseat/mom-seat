import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OCR from "./pages/OCR";
import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/ocr" element={<OCR />} />
        <Route path="/" element={<div>홈 페이지</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

