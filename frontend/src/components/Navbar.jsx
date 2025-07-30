import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ marginBottom: "20px" }}>
      <Link to="/login"><button>로그인</button></Link>
      <Link to="/signup"><button>회원가입</button></Link>
      <Link to="/ocr"><button>임신확인서</button></Link>
      <Link to="/"><button>홈</button></Link>
    </nav>
  );
}

export default Navbar;
