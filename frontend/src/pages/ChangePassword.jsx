// frontend/src/pages/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ChangePassword() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!form.current || !form.next) return setMsg('비밀번호를 입력하세요.');
    if (form.next !== form.confirm) return setMsg('새 비밀번호가 일치하지 않습니다.');
    if (form.next.length < 6) return setMsg('새 비밀번호는 6자 이상이어야 합니다.');

    setLoading(true);
    try {
      // 1) 재인증
      const cred = EmailAuthProvider.credential(user.email, form.current);
      await reauthenticateWithCredential(user, cred);
      // 2) 변경
      await updatePassword(user, form.next);
      setMsg('비밀번호가 변경되었습니다.');
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => navigate('/profile'), 800);
    } catch (err) {
      let text = '변경 실패: ';
      switch (err.code) {
        case 'auth/wrong-password': text += '현재 비밀번호가 올바르지 않습니다.'; break;
        case 'auth/too-many-requests': text += '시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'; break;
        default: text += err.message || '오류가 발생했습니다.';
      }
      setMsg(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#7D6073' }}>비밀번호 변경</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">현재 비밀번호</label>
            <input
              type="password"
              name="current"
              value={form.current}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="현재 비밀번호"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">새 비밀번호</label>
            <input
              type="password"
              name="next"
              value={form.next}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="영문+숫자 조합 권장 (6자 이상)"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="새 비밀번호 확인"
              required
            />
          </div>

          {msg && <p className="text-sm" style={{ color: msg.includes('변경되었습니다') ? '#16a34a' : '#dc2626' }}>{msg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg p-3 text-white"
              style={{ background: loading ? '#c7c7c7' : '#E9A7B9' }}
            >
              {loading ? '변경 중...' : '변경하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
