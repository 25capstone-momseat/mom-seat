import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import styles from "../../styles/modules/Login.module.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", global: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErrors((er) => ({ ...er, [id]: "", global: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const nextErrors = { email: "", password: "", global: "" };
    if (!form.email.trim()) { nextErrors.email = "이메일을 입력해주세요."; hasError = true; }
    if (!form.password)     { nextErrors.password = "비밀번호를 입력해주세요."; hasError = true; }
    setErrors(nextErrors);
    if (hasError) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (error) {
      let msg = "로그인에 실패했습니다.";
      switch (error.code) {
        case "auth/user-not-found":    msg = "등록되지 않은 이메일입니다."; break;
        case "auth/wrong-password":    msg = "비밀번호가 올바르지 않습니다."; break;
        case "auth/invalid-email":     msg = "올바르지 않은 이메일 형식입니다."; break;
        case "auth/user-disabled":     msg = "비활성화된 계정입니다."; break;
        case "auth/too-many-requests": msg = "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."; break;
        default:                       msg = error.message || msg;
      }
      setErrors((er) => ({ ...er, global: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        {/* Logo */}
        <h1 className={styles.logoTitle}>
          <span className={styles.mam}>맘</span>
          <span className={styles.comfort}>편한자리</span>
        </h1>

        {/* Form Section */}
        <div className={styles.formSection}>
          {/* Error Message */}
          {errors.global && (
            <div className={styles.errorMessage}>
              {errors.global}
            </div>
          )}

          {/* Input Group & Button */}
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="이메일을 입력해주세요."
                  className={errors.email ? styles.inputError : ''}
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.email && (
                  <p className={styles.fieldError}>{errors.email}</p>
                )}
              </div>

              <div className={styles.inputField}>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="비밀번호를 입력해주세요"
                  className={errors.password ? styles.inputError : ''}
                  autoComplete="current-password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className={styles.fieldError}>{errors.password}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? "로그인 중..." : "로그인하기"}
            </button>
          </form>

          {/* Footer Links */}
          <div className={styles.footerLinks}>
            <Link to="/signup" className={styles.link}>
              회원가입하기
            </Link>
            <span className={styles.separator}>|</span>
            <Link to="/reset-password" className={styles.link}>
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}