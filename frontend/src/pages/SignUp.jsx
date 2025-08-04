import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithPhoneNumber, 
  RecaptchaVerifier 
} from "firebase/auth";
import { auth } from "../config/firebase";

function SignUp() {
  // 1. 모든 상태를 React state로 관리
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: ""
  });

  // 2. 인증 관련 상태들
  const [authState, setAuthState] = useState({
    otpSent: false,           // 인증번호 전송 여부
    confirmationResult: null, // Firebase에서 반환하는 확인 객체
    isLoading: false,         // 로딩 상태
    recaptchaVerifier: null   // reCAPTCHA 검증기
  });

  const navigate = useNavigate();

  // 3. 컴포넌트가 언마운트될 때 reCAPTCHA 정리
  useEffect(() => {
    return () => {
      if (authState.recaptchaVerifier) {
        authState.recaptchaVerifier.clear();
      }
    };
  }, [authState.recaptchaVerifier]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // 4. 전화번호 형식 검증 함수
  const validatePhoneNumber = (phone) => {
    // 한국 전화번호 형식: +82로 시작하고 10-11자리 숫자
    const phoneRegex = /^\+82[1-9][0-9]{8,9}$/;
    return phoneRegex.test(phone);
  };

  // 5. 인증번호 전송 함수
  const sendOTP = async () => {
    if (!form.phone) {
      alert("휴대폰 번호를 입력하세요.");
      return;
    }

    if (!validatePhoneNumber(form.phone)) {
      alert("휴대폰 번호를 +8210xxxxxxxx 형식으로 입력하세요.");
      return;
    }

    // 로딩 시작
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // 기존 reCAPTCHA 정리
      if (authState.recaptchaVerifier) {
        authState.recaptchaVerifier.clear();
      }

      // 새로운 reCAPTCHA 생성
      const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA 해결됨:", response);
        },
        'expired-callback': () => {
          console.log("reCAPTCHA 만료됨");
          setAuthState(prev => ({ 
            ...prev, 
            recaptchaVerifier: null 
          }));
        }
      });

      // Firebase 전화번호 인증 요청
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        form.phone, 
        recaptchaVerifier
      );
      
      // 성공적으로 인증번호가 전송되면 상태 업데이트
      setAuthState(prev => ({
        ...prev,
        confirmationResult: confirmationResult,
        recaptchaVerifier: recaptchaVerifier,
        otpSent: true,
        isLoading: false
      }));

      alert("인증번호가 전송되었습니다.");
      
    } catch (error) {
      console.error("인증 요청 실패:", error);
      
      // 구체적인 오류 메시지 제공
      let errorMessage = "인증 요청 실패: ";
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage += "올바르지 않은 전화번호 형식입니다.";
          break;
        case 'auth/too-many-requests':
          errorMessage += "너무 많은 요청이 있었습니다. 나중에 다시 시도해주세요.";
          break;
        case 'auth/quota-exceeded':
          errorMessage += "일일 SMS 할당량을 초과했습니다.";
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      // 실패 시 reCAPTCHA 정리 및 상태 초기화
      if (authState.recaptchaVerifier) {
        authState.recaptchaVerifier.clear();
      }
      
      setAuthState(prev => ({
        ...prev,
        recaptchaVerifier: null,
        isLoading: false
      }));
    }
  };

  // 6. 회원가입 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.otp) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // 전화번호 인증 확인
    if (!authState.confirmationResult) {
      alert("먼저 휴대폰 인증을 완료해주세요.");
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // 7. 인증번호 확인
      const phoneAuthResult = await authState.confirmationResult.confirm(form.otp);
      console.log("전화번호 인증 성공:", phoneAuthResult.user);

      // 8. 이메일로 회원가입 (전화번호 인증된 사용자)
      const emailAuthResult = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      
      console.log("이메일 회원가입 성공:", emailAuthResult.user);
      
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
      
    } catch (error) {
      console.error("회원가입 실패:", error);
      
      let errorMessage = "회원가입 실패: ";
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage += "인증번호가 올바르지 않습니다.";
          break;
        case 'auth/code-expired':
          errorMessage += "인증번호가 만료되었습니다. 다시 요청해주세요.";
          // 만료된 경우 상태 초기화
          setAuthState(prev => ({
            ...prev,
            otpSent: false,
            confirmationResult: null
          }));
          setForm(prev => ({ ...prev, otp: "" }));
          break;
        case 'auth/email-already-in-use':
          errorMessage += "이미 사용 중인 이메일입니다.";
          break;
        case 'auth/weak-password':
          errorMessage += "비밀번호가 너무 약합니다. 6자리 이상 입력해주세요.";
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 9. 인증번호 재전송 함수
  const resendOTP = () => {
    setAuthState(prev => ({
      ...prev,
      otpSent: false,
      confirmationResult: null
    }));
    setForm(prev => ({ ...prev, otp: "" }));
  };

  return (
    <div className="container">
      <h2>회원 가입</h2>
      <form onSubmit={handleSubmit}>
        <input 
          id="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="이름" 
          disabled={authState.isLoading}
          required
        />
        
        <input 
          id="email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          placeholder="이메일" 
          disabled={authState.isLoading}
          required
        />
        
        <input 
          id="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="비밀번호 (6자리 이상)" 
          disabled={authState.isLoading}
          minLength="6"
          required
        />
        
        <input 
          id="confirmPassword" 
          type="password" 
          value={form.confirmPassword} 
          onChange={handleChange} 
          placeholder="비밀번호 확인" 
          disabled={authState.isLoading}
          required
        />

        {/* 전화번호 입력 및 인증 요청 */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input 
            id="phone" 
            value={form.phone} 
            onChange={handleChange} 
            placeholder="휴대폰 번호 (+82101234567형식)" 
            style={{ flex: 1 }} 
            disabled={authState.isLoading || authState.otpSent}
            required
          />
          <button 
            type="button" 
            onClick={sendOTP} 
            disabled={authState.isLoading || authState.otpSent}
            style={{ 
              flex: "0 0 100px", 
              backgroundColor: authState.otpSent ? "#4CAF50" : "#2196F3",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "4px",
              cursor: (authState.isLoading || authState.otpSent) ? "not-allowed" : "pointer"
            }}
          >
            {authState.isLoading ? "전송중..." : (authState.otpSent ? "전송완료" : "인증요청")}
          </button>
        </div>

        {/* 인증번호 입력 (인증번호가 전송되었을 때만 표시) */}
        {authState.otpSent && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input 
                id="otp" 
                value={form.otp} 
                onChange={handleChange} 
                placeholder="인증번호 6자리 입력" 
                style={{ flex: 1 }}
                disabled={authState.isLoading}
                maxLength="6"
                required
              />
              <button 
                type="button" 
                onClick={resendOTP}
                disabled={authState.isLoading}
                style={{ 
                  flex: "0 0 80px",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              >
                재전송
              </button>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={authState.isLoading || !authState.otpSent}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: (authState.isLoading || !authState.otpSent) ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: (authState.isLoading || !authState.otpSent) ? "not-allowed" : "pointer"
          }}
        >
          {authState.isLoading ? "처리중..." : "회원가입하기"}
        </button>
      </form>
      
      <div className="sub-actions" style={{ marginTop: "16px", textAlign: "center" }}>
        <Link to="/login">로그인으로 돌아가기</Link>
      </div>

      {/* reCAPTCHA 컨테이너 */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default SignUp;