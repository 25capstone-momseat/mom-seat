// frontend/src/pages/SignUp.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../config/api";
import styles from "../../styles/modules/SignUp.module.css";

export default function SignUp() {
  // --- form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Keep for UI validation
  });

  // --- ui / validation
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    global: "",
  });

  // email duplication check state
  const [emailCheck, setEmailCheck] = useState({
    checked: false,
    available: false,
    checking: false,
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    // clear field error on change
    setErrors((er) => ({ ...er, [id]: "", global: "" }));
    if (id === "email") setEmailCheck({ checked: false, available: false, checking: false, message: "" });
  };

  // client-side validation
  const validateClient = () => {
    const er = {};
    if (!form.name.trim()) er.name = "이름을 입력해주세요.";
    if (!form.email.trim()) er.email = "이메일을 입력해주세요.";
    if (!form.password) er.password = "비밀번호를 입력해주세요.";
    if (form.password.length < 6) er.password = "비밀번호는 6자리 이상 입력해주세요.";
    if (form.password !== form.confirmPassword) {
      er.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    setErrors((prev) => ({ ...prev, ...er }));
    return er;
  };

  // Check for email duplication
  const checkEmail = async () => {
    if (!form.email.trim()) {
      setErrors((er) => ({ ...er, email: "이메일을 입력해주세요." }));
      return;
    }
    setEmailCheck((s) => ({ ...s, checking: true, message: "" }));
    try {
      const methods = await fetchSignInMethodsForEmail(auth, form.email);
      const available = methods.length === 0;
      setEmailCheck({ checked: true, available, checking: false, message: available ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다." });
      if (!available) setErrors((er) => ({ ...er, email: "이미 사용 중인 이메일입니다." }));
    } catch (e) {
      setEmailCheck({ checked: false, available: false, checking: false, message: "이메일 확인 중 오류가 발생했습니다." });
      setErrors((er) => ({ ...er, email: e.message || "이메일 확인 실패" }));
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const er = validateClient();
    if (Object.keys(er).length > 0) return;

    if (!emailCheck.checked || !emailCheck.available) {
      setErrors((prev) => ({ ...prev, email: "이메일 중복 확인을 해주세요." }));
      return;
    }

    setSubmitting(true);
    try {
      // A) Create user with email and password
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // B) Set display name
      await updateProfile(user, { displayName: form.name });

      // C) Save profile to Firestore (backend)
      try {
        await api.post("/profile", { name: form.name, email: user.email });
      } catch (apiError) {
        console.error("Failed to save profile to Firestore:", apiError);
        // This is not fatal for the user's sign-up process itself
      }

      navigate("/"); // Navigate to home on success
    } catch (e) {
      console.error(e);
      if (e?.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
      } else if (e?.code === "auth/weak-password") {
        setErrors((prev) => ({ ...prev, password: "비밀번호는 6자리 이상이어야 합니다." }));
      } else {
        setErrors((prev) => ({ ...prev, global: e.message || "회원가입에 실패했습니다." }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ‹
          </button>
          <h1 className={styles.headerTitle}>회원 가입</h1>
        </div>

        {/* Global error */}
        {errors.global && <p className={styles.globalError}>{errors.global}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 이름 */}
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <label className={styles.formLabel}>이름</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={updateField}
                className={styles.formInput}
                required
              />
            </div>
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          {/* 이메일 + 중복 확인 */}
          <div className={styles.formGroup}>
            <div className={`${styles.inputContainer} ${styles.withButton}`}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className={styles.formLabel}>이메일</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  className={styles.formInput}
                  required
                />
              </div>
              <button
                type="button"
                onClick={checkEmail}
                disabled={emailCheck.checking || !form.email}
                className={styles.verifyButton}
              >
                {emailCheck.checking ? "확인중..." : "중복 확인"}
              </button>
            </div>
            {(errors.email || emailCheck.message) && (
              <p className={emailCheck.available ? styles.successText : styles.errorText}>
                {errors.email || emailCheck.message}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <label className={styles.formLabel}>비밀번호</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={updateField}
                className={styles.formInput}
                required
                minLength={6}
              />
            </div>
            <p className={styles.helperText}>6자리 이상으로 입력해주세요.</p>
            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.formGroup}>
            <div className={styles.inputContainer}>
              <label className={styles.formLabel}>비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={updateField}
                className={styles.formInput}
                required
              />
            </div>
            {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || !emailCheck.available}
            className={`${styles.submitButton} ${(submitting || !emailCheck.available) ? styles.disabled : ''}`}
          >
            {submitting ? "처리중..." : "회원가입하기"}
          </button>
        </form>

        {/* Login link */}
        <div className={styles.loginLink}>
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
