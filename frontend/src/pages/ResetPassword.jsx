import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!email) return setMsg('이메일을 입력해주세요.');

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.');
    } catch (err) {
      let t = '전송 실패: ';
      switch (err.code) {
        case 'auth/user-not-found': t += '등록되지 않은 이메일입니다.'; break;
        case 'auth/invalid-email':  t += '올바르지 않은 이메일 형식입니다.'; break;
        default:                    t += err.message;
      }
      setMsg(t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#7D6073' }}>비밀번호 찾기</h1>
        <form onSubmit={onSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="가입한 이메일 주소"
              required
            />
          </div>
          {msg && (
            <p className="text-sm" style={{ color: msg.startsWith('비밀번호') ? '#16a34a' : '#dc2626' }}>
              {msg}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg p-3 text-white"
            style={{ background: loading ? '#c7c7c7' : '#E9A7B9' }}
          >
            {loading ? '전송 중...' : '재설정 메일 보내기'}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="underline text-sm">로그인으로 돌아가기</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
