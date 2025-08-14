// // frontend/src/pages/Login.jsx
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../config/firebase";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({ email: "", password: "", global: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onChange = (e) => {
//     const { id, value } = e.target;
//     setForm((f) => ({ ...f, [id]: value }));
//     setErrors((er) => ({ ...er, [id]: "", global: "" }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();

//     // simple checks
//     let hasError = false;
//     const nextErrors = { email: "", password: "", global: "" };
//     if (!form.email.trim()) { nextErrors.email = "이메일을 입력해주세요."; hasError = true; }
//     if (!form.password)     { nextErrors.password = "비밀번호를 입력해주세요."; hasError = true; }
//     setErrors(nextErrors);
//     if (hasError) return;

//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, form.email, form.password);
//       navigate("/"); // Home — AuthContext will greet
//     } catch (error) {
//       let msg = "로그인에 실패했습니다.";
//       switch (error.code) {
//         case "auth/user-not-found":    msg = "등록되지 않은 이메일입니다."; break;
//         case "auth/wrong-password":    msg = "비밀번호가 올바르지 않습니다."; break;
//         case "auth/invalid-email":     msg = "올바르지 않은 이메일 형식입니다."; break;
//         case "auth/user-disabled":     msg = "비활성화된 계정입니다."; break;
//         case "auth/too-many-requests": msg = "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."; break;
//         default:                       msg = error.message || msg;
//       }
//       setErrors((er) => ({ ...er, global: msg }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 to-rose-50 flex items-center justify-center px-6">
//       <div className="w-full max-w-sm">
//         {/* Title */}
//         <h1 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-rose-400">
//           맘편한자리
//         </h1>

//         {/* Card */}
//         <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
//           {errors.global && <p className="mb-3 text-sm text-red-500">{errors.global}</p>}

//           <form onSubmit={onSubmit} className="space-y-3">
//             <div>
//               <input
//                 id="email"
//                 type="email"
//                 value={form.email}
//                 onChange={onChange}
//                 placeholder="이메일을 입력해주세요."
//                 className="w-full rounded-xl bg-white px-4 py-3 text-gray-700 shadow-sm outline-none ring-1 ring-rose-100 focus:ring-2 focus:ring-rose-300"
//                 autoComplete="email"
//                 disabled={loading}
//               />
//               {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
//             </div>

//             <div>
//               <input
//                 id="password"
//                 type="password"
//                 value={form.password}
//                 onChange={onChange}
//                 placeholder="비밀번호를 입력해주세요."
//                 className="w-full rounded-xl bg-white px-4 py-3 text-gray-700 shadow-sm outline-none ring-1 ring-rose-100 focus:ring-2 focus:ring-rose-300"
//                 autoComplete="current-password"
//                 disabled={loading}
//               />
//               {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="mt-2 w-full rounded-xl py-3 text-white transition disabled:opacity-50"
//               style={{ background: "#E9A7B9" }}
//             >
//               {loading ? "로그인 중..." : "로그인하기"}
//             </button>
//           </form>
//         </div>

//         {/* Footer: only sign-up link (비번찾기 제거) */}
//         <div className="mt-4 text-center text-sm text-gray-500">
//           <Link to="/signup" className="hover:underline">
//             회원가입하기
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

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
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 to-rose-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-rose-400">
          맘편한자리
        </h1>

        <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
          {errors.global && <p className="mb-3 text-sm text-red-500">{errors.global}</p>}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="이메일을 입력해주세요."
                className="w-full rounded-xl bg-white px-4 py-3 text-gray-700 shadow-sm outline-none ring-1 ring-rose-100 focus:ring-2 focus:ring-rose-300"
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="비밀번호를 입력해주세요."
                className="w-full rounded-xl bg-white px-4 py-3 text-gray-700 shadow-sm outline-none ring-1 ring-rose-100 focus:ring-2 focus:ring-rose-300"
                autoComplete="current-password"
                disabled={loading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 text-white transition disabled:opacity-50"
              style={{ background: "#E9A7B9" }}
            >
              {loading ? "로그인 중..." : "로그인하기"}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 space-x-2">
          <Link to="/signup" className="hover:underline">회원가입하기</Link>
          <span className="text-gray-300">|</span>
          <Link to="/reset-password" className="hover:underline">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}
