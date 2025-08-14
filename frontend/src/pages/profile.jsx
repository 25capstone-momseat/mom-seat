// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { updateProfile } from 'firebase/auth';
import { User } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, name: ctxName, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    birth: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  // 내 프로필 불러오기
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/profile/me');
        if (!mounted) return;
        setForm({
          name: data?.name || ctxName || user?.displayName || '',
          email: user?.email || data?.email || '',
          phone: data?.phone || '',
          birth: data?.birth || '',
        });
      } catch {
        setForm((p) => ({
          ...p,
          name: ctxName || user?.displayName || '',
          email: user?.email || '',
        }));
      }
    })();
    return () => { mounted = false; };
  }, [user, ctxName]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      // 1) 백엔드 업데이트
      await api.put('/profile/me', {
        name: form.name,
        phone: form.phone,
        birth: form.birth,
      });
      // 2) Firebase displayName 동기화
      if (user && form.name && user.displayName !== form.name) {
        await updateProfile(user, { displayName: form.name });
      }
      setMsg('프로필이 저장되었습니다.');
    } catch (err) {
      setMsg(err.userMessage || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={28} style={{ color: '#7D6073' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#7D6073' }}>회원 정보 수정</h1>
        </div>

        <form onSubmit={onSave} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이름</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">생년월일</label>
            <input
              name="birth"
              value={form.birth}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">휴대전화번호</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="w-full border rounded-lg p-3"
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">E-mail</label>
            <input
              name="email"
              value={form.email}
              className="w-full border rounded-lg p-3 bg-gray-50"
              readOnly
            />
          </div>

          {msg && <p className="text-sm" style={{ color: msg.includes('저장') ? '#16a34a' : '#dc2626' }}>{msg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/profile/password')}
              className="flex-1 border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
            >
              비밀번호 변경
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg p-3 text-white"
              style={{ background: saving ? '#c7c7c7' : '#E9A7B9' }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
