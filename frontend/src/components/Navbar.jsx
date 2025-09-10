// import React from "react";
// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav style={{ marginBottom: "20px" }}>
//       <Link to="/login"><button>로그인</button></Link>
//       <Link to="/signup"><button>회원가입</button></Link>
//       <Link to="/ocr"><button>임신확인서</button></Link>
//       <Link to="/"><button>홈</button></Link>
//     </nav>
//   );
// }

// export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // AuthContext에 user, loading이 있다고 가정

  const onLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      alert('로그아웃에 실패했습니다: ' + (e.message || ''));
    }
  };

  // 아주 단순한 버튼 스타일(스크린샷 느낌)
  const Btn = ({ children, ...p }) => (
    <button
      {...p}
      style={{ padding: '8px 14px', border: '1px solid #cfcfcf', borderRadius: 6, background: '#eee' }}
    >
      {children}
    </button>
  );

  return (
    <nav style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
      {/* 로그인 상태에 따라 로그인/로그아웃 토글 */}
      {!loading && (user ? (
        <Btn onClick={onLogout}>로그아웃</Btn>
      ) : (
        <Link to="/login"><Btn>로그인</Btn></Link>
      ))}

      {/* 로그인 안 되어 있을 때만 회원가입 노출(선택) */}
      {!user && <Link to="/signup"><Btn>회원가입</Btn></Link>}

      <Link to="/ocr"><Btn>임신확인서</Btn></Link>
      <Link to="/"><Btn>홈</Btn></Link>
    </nav>
  );
}
