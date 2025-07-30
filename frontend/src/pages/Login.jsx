import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    console.log("로그인 시도:", { email, password });
    alert("로그인 성공 (임시)");
  };

  return (
    <div className="container">
      <h2>맘편한자리</h2>
      <input
        type="email"
        placeholder="이메일을 입력해주세요..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인하기</button>
      <div className="sub-actions">
        <a href="#">회원가입하기</a>
      </div>
    </div>
  );
}

export default Login;
