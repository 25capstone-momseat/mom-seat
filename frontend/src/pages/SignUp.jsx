// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../config/api";

const PHONE_REGEX = /^\+82[1-9][0-9]{8,9}$/; // +8210XXXXXXXX

const formatMMSS = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function SignUp() {
  // --- form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "",
  });

  // --- ui / validation
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "",
    global: "",
  });

  // email duplication check state (중복 확인)
  const [emailCheck, setEmailCheck] = useState({
    checked: false,
    available: false,
    checking: false,
    message: "",
  });

  // otp / recaptcha state
  const [otpState, setOtpState] = useState({
    sent: false,
    confirmationResult: null,
    recaptcha: null,
  });
  const [timeLeft, setTimeLeft] = useState(0); // seconds

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // countdown timer
  useEffect(() => {
    if (!otpState.sent || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpState.sent, timeLeft]);

  // cleanup reCAPTCHA
  useEffect(() => {
    return () => {
      if (otpState.recaptcha) otpState.recaptcha.clear();
    };
  }, [otpState.recaptcha]);

  const updateField = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    // clear field error on change
    setErrors((er) => ({ ...er, [id]: "", global: "" }));
    if (id === "email") setEmailCheck({ checked: false, available: false, checking: false, message: "" });
  };

  // quick client validations to render inline messages
  const validateClient = () => {
    const er = {};
    if (!form.name.trim()) er.name = "이름을 입력해주세요.";
    if (!form.email.trim()) er.email = "이메일을 입력해주세요.";
    if (!form.password) er.password = "비밀번호를 입력해주세요.";
    if (form.password && form.password.length < 6) er.password = "비밀번호는 6자리 이상 입력해주세요.";
    if (!form.confirmPassword) er.confirmPassword = "비밀번호 확인을 입력해주세요.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      er.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!form.phone.trim()) er.phone = "휴대폰 번호를 입력해주세요.";
    if (form.phone && !PHONE_REGEX.test(form.phone)) er.phone = "+8210XXXXXXXX 형식으로 입력해주세요.";
    if (otpState.sent && !form.otp.trim()) er.otp = "인증번호를 입력해주세요.";
    setErrors((prev) => ({ ...prev, ...er }));
    return er;
  };

  // 이메일 중복 확인 (fetchSignInMethodsForEmail)
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

  // OTP 전송
  const sendOTP = async () => {
    // validate phone only (UX: others can be empty here)
    if (!form.phone.trim()) {
      setErrors((er) => ({ ...er, phone: "휴대폰 번호를 입력해주세요." }));
      return;
    }
    if (!PHONE_REGEX.test(form.phone)) {
      setErrors((er) => ({ ...er, phone: "+8210XXXXXXXX 형식으로 입력해주세요." }));
      return;
    }

    try {
      if (otpState.recaptcha) otpState.recaptcha.clear();
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      });
      const confirmationResult = await signInWithPhoneNumber(auth, form.phone, recaptcha);
      setOtpState({ sent: true, confirmationResult, recaptcha });
      setTimeLeft(180); // 3분
    } catch (e) {
      let msg = "인증 요청 실패";
      if (e?.code === "auth/too-many-requests") msg = "요청이 너무 많습니다. 잠시 후 다시 시도하세요.";
      else if (e?.code === "auth/quota-exceeded") msg = "일일 SMS 할당량을 초과했습니다.";
      else if (e?.code === "auth/invalid-phone-number") msg = "올바르지 않은 전화번호 형식입니다.";
      setErrors((er) => ({ ...er, phone: msg }));
    }
  };

  const resendOTP = async () => {
    setForm((f) => ({ ...f, otp: "" }));
    setOtpState((s) => ({ ...s, sent: false, confirmationResult: null }));
    await sendOTP();
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // client-side
    const er = validateClient();
    if (Object.keys(er).length) return;

    // if user didn't press "중복 확인", auto-check on submit
    if (!emailCheck.checked) {
      const methods = await fetchSignInMethodsForEmail(auth, form.email);
      if (methods.length > 0) {
        setEmailCheck({ checked: true, available: false, checking: false, message: "이미 사용 중인 이메일입니다." });
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
        return;
      }
    }

    if (!otpState.sent) {
      setErrors((prev) => ({ ...prev, phone: "먼저 인증번호를 요청해주세요." }));
      return;
    }
    if (timeLeft <= 0) {
      setErrors((prev) => ({ ...prev, otp: "인증번호가 만료되었습니다. 재전송해주세요." }));
      return;
    }

    setSubmitting(true);
    try {
      // A) OTP 확인 => 현재 유저는 '전화번호'로 로그인된 상태
      const { user: phoneUser } = await otpState.confirmationResult.confirm(form.otp);

      // B) 같은 계정에 이메일/비번 링크
      const cred = EmailAuthProvider.credential(form.email, form.password);
      await linkWithCredential(phoneUser, cred);

      // C) displayName 세팅 (즉시 인사)
      await updateProfile(phoneUser, { displayName: form.name });

      // D) 프로필을 Firestore에 저장 (백엔드)
      try {
        await api.post("/profile", { name: form.name, email: phoneUser.email || form.email });
      } catch {
        // not fatal for greeting
      }

      navigate("/"); // 홈으로 이동 (AuthContext가 “안녕하세요, {이름}님!” 표시)
    } catch (e) {
      console.error(e);
      if (e?.code === "auth/invalid-verification-code") {
        setErrors((prev) => ({ ...prev, otp: "인증번호가 올바르지 않습니다." }));
      } else if (e?.code === "auth/code-expired") {
        setErrors((prev) => ({ ...prev, otp: "인증번호가 만료되었습니다. 재전송해주세요." }));
        setTimeLeft(0);
      } else if (e?.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
      } else if (e?.code === "auth/credential-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "해당 이메일이 이미 다른 계정에 연결되어 있습니다." }));
      } else {
        setErrors((prev) => ({ ...prev, global: e.message || "회원가입에 실패했습니다." }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">회원 가입</h2>

      {/* global error */}
      {errors.global && <p className="mb-3 text-sm text-red-500">{errors.global}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 이름 */}
        <div>
          <input
            id="name"
            value={form.name}
            onChange={updateField}
            placeholder="이름"
            className="w-full rounded-xl bg-pink-50 px-4 py-3 outline-none"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* 이메일 + 중복 확인 */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="이메일"
              className="w-full rounded-xl bg-pink-50 px-4 py-3 outline-none"
              required
            />
            {(errors.email || emailCheck.message) && (
              <p className={`mt-1 text-xs ${emailCheck.available ? "text-green-600" : "text-red-500"}`}>
                {errors.email || emailCheck.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={checkEmail}
            disabled={emailCheck.checking || !form.email}
            className="shrink-0 rounded-xl px-3 py-2 text-sm text-white"
            style={{ background: "#E9A7B9" }}
          >
            {emailCheck.checking ? "확인중..." : "중복 확인"}
          </button>
        </div>

        {/* 비밀번호 */}
        <div>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="비밀번호"
            className="w-full rounded-xl bg-pink-50 px-4 py-3 outline-none"
            required
            minLength={6}
          />
          <p className="mt-1 text-[11px] text-gray-400">6자리 이상으로 입력해주세요.</p>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            placeholder="비밀번호 확인"
            className="w-full rounded-xl bg-pink-50 px-4 py-3 outline-none"
            required
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* 휴대폰 번호 + 인증요청 */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              id="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="휴대폰 번호 (+8210XXXXXXXX)"
              className="w-full rounded-xl bg-pink-50 px-4 py-3 outline-none"
              required
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          <button
            type="button"
            onClick={sendOTP}
            disabled={otpState.sent && timeLeft > 0}
            className="shrink-0 rounded-xl px-3 py-2 text-sm text-white"
            style={{ background: otpState.sent && timeLeft > 0 ? "#9CA3AF" : "#E9A7B9" }}
          >
            {otpState.sent && timeLeft > 0 ? "전송완료" : "인증요청"}
          </button>
        </div>

        {/* 인증번호 + 남은 시간 + 재전송 */}
        {otpState.sent && (
          <div>
            <div className="flex items-center gap-2">
              <input
                id="otp"
                value={form.otp}
                onChange={updateField}
                placeholder="인증번호 입력"
                className="flex-1 rounded-xl bg-pink-50 px-4 py-3 outline-none"
                maxLength={6}
                required
              />
              <span className="text-xs text-gray-400 w-16 text-right">
                남은 시간 {formatMMSS(Math.max(timeLeft, 0))}
              </span>
              <button
                type="button"
                onClick={resendOTP}
                disabled={timeLeft > 0}
                className="shrink-0 rounded-xl px-3 py-2 text-sm text-white"
                style={{ background: timeLeft > 0 ? "#9CA3AF" : "#E9A7B9" }}
              >
                재전송
              </button>
            </div>
            {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
          </div>
        )}

        {/* submit */}
        <button
          type="submit"
          disabled={submitting || !otpState.sent}
          className="mt-2 w-full rounded-xl py-3 text-white text-base"
          style={{ background: submitting || !otpState.sent ? "#E5E7EB" : "#E9A7B9" }}
        >
          {submitting ? "처리중..." : "회원가입하기"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-gray-500 underline">로그인으로 돌아가기</Link>
      </div>

      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container"></div>
    </div>
  );
}