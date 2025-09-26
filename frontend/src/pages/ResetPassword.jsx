import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Link } from 'react-router-dom';
import styles from '../../styles/modules/ResetPassword.module.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info'); // 'info', 'success', 'error'
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setMsgType('info');
    if (!email) {
      setMsg('이메일을 입력해주세요.');
      setMsgType('error');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('입력하신 이메일이 가입되어 있다면, 비밀번호 재설정 링크를 보내드렸습니다. 메일함을 확인해주세요.');
      setMsgType('success');
    } catch (err) {
      let t = '전송 실패: ';
      switch (err.code) {
        case 'auth/invalid-email':  t += '올바르지 않은 이메일 형식입니다.'; break;
        default:                    t += '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      setMsg(t);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <svg className={styles.titleIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1"/>
          </svg>
          비밀번호 찾기
        </h1>
        
        <p className={styles.subtitle}>
          가입한 이메일 주소를 입력하시면<br/>
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        {msg && (
          <div className={msgType === 'success' ? styles.successMessage : styles.errorMessage}>
            {msgType === 'success' ? '✉️' : '❌'} {msg}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formInput}
              placeholder="이메일 주소를 입력하세요"
              required
            />
            <p className={styles.hintText}>가입 시 사용한 이메일을 입력해주세요.</p>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.btnPrimary} ${loading ? styles.disabled : ''}`}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  전송 중...
                </>
              ) : (
                '재설정 메일 보내기'
              )}
            </button>
            
            <Link to="/login" className={styles.btnSecondary}>
              로그인으로 돌아가기
            </Link>
          </div>
        </form>

        <div className={styles.divider}>
          <span>또는</span>
        </div>

        <div className={styles.linkWrapper}>
          <Link to="/signup" className={styles.link}>
            아직 계정이 없으신가요? 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}