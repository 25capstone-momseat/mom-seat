// import React, { useState } from "react";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = () => {
//     if (!email || !password) {
//       alert("이메일과 비밀번호를 입력해주세요.");
//       return;
//     }
//     console.log("로그인 시도:", { email, password });
//     alert("로그인 성공 (임시)");
//   };

//   return (
//     <div className="container">
//       <h2>맘편한자리</h2>
//       <input
//         type="email"
//         placeholder="이메일을 입력해주세요..."
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="비밀번호를 입력해주세요"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={handleLogin}>로그인하기</button>
//       <div className="sub-actions">
//         <a href="#">회원가입하기</a>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log("로그인 성공:", userCredential.user);
      
      alert("로그인 성공!");
      navigate("/home"); // 홈 화면으로 이동
      
    } catch (error) {
      console.error("로그인 실패:", error);
      
      let errorMessage = "로그인 실패: ";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += "등록되지 않은 이메일입니다.";
          break;
        case 'auth/wrong-password':
          errorMessage += "비밀번호가 올바르지 않습니다.";
          break;
        case 'auth/invalid-email':
          errorMessage += "올바르지 않은 이메일 형식입니다.";
          break;
        case 'auth/user-disabled':
          errorMessage += "비활성화된 계정입니다.";
          break;
        case 'auth/too-many-requests':
          errorMessage += "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "20px"
    }}>

      {/* 메인 제목 */}
      <h1 style={{
        fontSize: "48px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "40px",
        margin: "0 0 40px 0"
      }}>
        맘편한자리
      </h1>

      {/* 로그인 폼 */}
      <div style={{
        maxWidth: "500px",
        margin: "0"
      }}>
        <form onSubmit={handleLogin}>
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "center"
          }}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                minWidth: "200px"
              }}
              required
            />
            
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                minWidth: "200px"
              }}
              required
            />
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                backgroundColor: isLoading ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: isLoading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {isLoading ? "로그인 중..." : "로그인하기"}
            </button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <div style={{ marginTop: "20px" }}>
          <Link 
            to="/signup"
            style={{
              color: "#4CAF50",
              textDecoration: "underline",
              fontSize: "16px"
            }}
          >
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;