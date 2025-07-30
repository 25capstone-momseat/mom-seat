import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log("회원가입 요청:", form);
    // TODO: 서버 연동
    navigate("/login");
  };

  const sendOTP = () => {
    if (!form.phone) {
      alert("휴대폰 번호를 입력하세요.");
      return;
    }

    alert(`인증번호가 ${form.phone}으로 전송되었습니다. (모의 동작)`);
  };

  return (
    <div className="container">
      <h2>회원 가입</h2>
      <form onSubmit={handleSubmit}>
        <input id="name" value={form.name} onChange={handleChange} placeholder="이름" />
        <input id="email" value={form.email} onChange={handleChange} placeholder="이메일" />
        <input id="password" type="password" value={form.password} onChange={handleChange} placeholder="비밀번호" />
        <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="비밀번호 확인" />

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input id="phone" value={form.phone} onChange={handleChange} placeholder="휴대폰 번호" style={{ flex: 1 }} />
          <button type="button" onClick={sendOTP} style={{ flex: 0.5, backgroundColor: "#ccc" }}>인증 요청</button>
        </div>

        <input id="otp" value={form.otp} onChange={handleChange} placeholder="인증번호 입력" />

        <button type="submit">회원가입하기</button>
      </form>
      <div className="sub-actions">
        <Link to="/login">로그인으로 돌아가기</Link>
      </div>
    </div>
  );
}

export default SignUp;
