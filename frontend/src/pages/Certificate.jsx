// frontend/src/pages/Certificate.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import api from '../config/api';
import { AuthContext } from '../contexts/AuthContext';

export default function Certificate() {
  const { user } = useContext(AuthContext); // Get user from context
  const [cert, setCert] = useState(null);
  const [form, setForm] = useState({
    name: '', hospital: '', issueDate: '', dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [ocring, setOcring] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user) {
        // If user is logged out, clear data and stop loading
        setCert(null);
        setForm({ name: '', hospital: '', issueDate: '', dueDate: '' });
        setLoading(false);
        return;
      }
      
      setLoading(true); // Start loading when user changes
      try {
        const { data } = await api.get('/certificate/me');
        const c = data?.certificate || null;
        setCert(c);
        if (c) {
          setForm({ name: c.name || '', hospital: c.hospital || '', issueDate: c.issueDate || '', dueDate: c.dueDate || '' });
        } else {
          // If no certificate for the new user, clear the form
          setForm({ name: '', hospital: '', issueDate: '', dueDate: '' });
        }
      } catch (_) {
        // On error, also clear data
        setCert(null);
        setForm({ name: '', hospital: '', issueDate: '', dueDate: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [user]); // Re-run when user object changes

  const onPickFile = () => fileRef.current?.click();

  const onOcr = async (file) => {
    if (!file) return;
    setOcring(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/certificate/ocr', fd, { timeout: 60000 });
      if (data?.success) {
        const { fields } = data;
        setForm((f) => ({
          ...f,
          name: fields?.name || f.name,
          hospital: fields?.hospital || f.hospital,
          issueDate: fields?.issueDate || f.issueDate,
          dueDate: fields?.dueDate || f.dueDate,   // 👈 예정일도 채움
        }));
      } else {
        alert('OCR 실패');
      }
    } catch (e) {
      alert('OCR 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setOcring(false);
    }
  };

  const onSave = async () => {
    try {
      const { data } = await api.post('/certificate', form);
      if (data?.success) {
        setCert(form);
        alert('인증서 정보가 저장되었습니다.');
      } else {
        alert('저장 실패');
      }
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-6">불러오는 중...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">임신확인서</h2>

      {/* 기존 저장된 값 프리뷰 */}
      {cert && (
        <div className="mb-6 rounded-xl bg-pink-50 p-4">
          <div className="font-semibold mb-2">저장된 정보</div>
          <div>산모이름: <b>{cert.name || '-'}</b></div>
          <div>병원: <b>{cert.hospital || '-'}</b></div>
          <div>발급일자: <b>{cert.issueDate || '-'}</b></div>
          <div>예정일: <b>{cert.dueDate || '-'}</b></div>
        </div>
      )}

      {/* 업로드 + OCR */}
      <div className="mb-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onOcr(e.target.files?.[0])}
        />
        <button
          onClick={onPickFile}
          className="rounded-xl px-4 py-2 text-white"
          style={{ background: '#E9A7B9' }}
          disabled={ocring}
        >
          {ocring ? '분석 중…' : '파일 업로드 및 OCR'}
        </button>
        <p className="text-xs text-gray-500 mt-1">이미지 또는 PDF를 업로드하면 자동으로 인식해요.</p>
      </div>

      {/* 편집/저장 폼 (OCR 결과가 여기로 들어옴) */}
      <div className="space-y-3">
        <input
          className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-rose-100 outline-none"
          placeholder="산모이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-rose-100 outline-none"
          placeholder="병원"
          value={form.hospital}
          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
        />
        <input
          className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-rose-100 outline-none"
          placeholder="발급일자 (YYYY-MM-DD)"
          value={form.issueDate}
          onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
        />
        <input
          className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-rose-100 outline-none"
          placeholder="예정일 (YYYY-MM-DD)"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />

        <button
          onClick={onSave}
          className="mt-2 w-full rounded-xl py-3 text-white"
          style={{ background: '#E9A7B9' }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
