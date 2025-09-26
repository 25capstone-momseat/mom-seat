// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../config/api';
import { updateProfile } from 'firebase/auth';
import styles from '../../styles/modules/Profile.module.css';

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
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(true);
    } catch (err) {
      setMsg(err.userMessage || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCancel = () => {
    if(window.confirm('변경사항이 저장되지 않습니다. 취소하시겠습니까?')) {
      navigate('/');
    }
  };

  const handlePasswordChange = () => {
    navigate('/profile/password');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <svg className={styles.titleIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          회원 정보 수정
        </h1>

        <form onSubmit={onSave}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이름</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className={styles.formInput}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>생년월일</label>
            <input
              name="birth"
              value={form.birth}
              onChange={onChange}
              className={styles.formInput}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>휴대전화번호</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={styles.formInput}
              placeholder="010-1234-5678"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input
              name="email"
              value={form.email}
              className={`${styles.formInput} ${styles.disabled}`}
              readOnly
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>비밀번호</label>
            <div className={styles.inputWithButton}>
              <input
                type="password"
                value="••••••••"
                className={`${styles.formInput} ${styles.disabled}`}
                disabled
              />
              <button
                type="button"
                onClick={handlePasswordChange}
                className={styles.changeBtn}
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          {msg && !showModal && (
            <p className={styles.errorMessage}>{msg}</p>
          )}

          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.actionBtn} ${styles.cancel}`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`${styles.actionBtn} ${styles.submit}`}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>✓</div>
            <h3 className={styles.modalTitle}>저장 완료</h3>
            <p className={styles.modalMessage}>저장이 완료되었습니다.</p>
            <button className={styles.modalBtn} onClick={closeModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}