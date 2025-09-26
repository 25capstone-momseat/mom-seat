import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import styles from '../../styles/modules/ActionHandler.module.css';

export default function ActionHandler() {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState('verifying'); // verifying | form | success | error
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');
  const [confirmHint, setConfirmHint] = useState('');

  useEffect(() => {
    if (mode !== 'resetPassword' || !oobCode) {
      setStatus('error');
      setError('잘못된 요청입니다. 링크가 올바른지 확인해주세요.');
      return;
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setStatus('form'); // Code is valid, show the form
      } catch (err) {
        console.error('Error verifying password reset code:', err);
        setStatus('error');
        setError('비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.');
      }
    };

    verifyCode();
  }, [mode, oobCode]);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (password.length === 0) {
      setPasswordHint('');
    } else if (password.length < 6) {
      setPasswordHint('error');
    } else {
      setPasswordHint('success');
    }
  };

  // 비밀번호 확인 검사
  const checkPasswordMatch = () => {
    if (confirmPassword.length === 0) {
      setConfirmHint('');
    } else if (newPassword !== confirmPassword) {
      setConfirmHint('error');
    } else {
      setConfirmHint('success');
    }
  };

  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  useEffect(() => {
    checkPasswordMatch();
  }, [confirmPassword, newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
    } catch (err) {
      console.error('Error confirming password reset:', err);
      setStatus('error');
      setError('비밀번호 재설정 중 오류가 발생했습니다. 링크가 만료되었을 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>링크를 확인하는 중입니다...</p>
            </div>
          </div>
        );
      
      case 'form':
        return (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>비밀번호 변경</h1>
            </div>
            
            <p className={styles.subtitle}>
              새로 사용하실 비밀번호를 설정해주세요.
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>새 비밀번호</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="새 비밀번호를 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showNewPassword ? (
                      <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className={`${styles.hintText} ${passwordHint === 'error' ? styles.error : passwordHint === 'success' ? styles.success : ''}`}>
                  {passwordHint === 'error' ? '❌ 비밀번호는 최소 6자리 이상이어야 합니다.' : 
                   passwordHint === 'success' ? '✓ 사용 가능한 비밀번호입니다.' : 
                   '비밀번호는 최소 6자리 이상이어야 합니다.'}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>새 비밀번호 확인</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showConfirmPassword ? (
                      <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className={`${styles.hintText} ${confirmHint === 'error' ? styles.error : confirmHint === 'success' ? styles.success : ''}`}>
                  {confirmHint === 'error' ? '❌ 비밀번호가 일치하지 않습니다.' : 
                   confirmHint === 'success' ? '✓ 비밀번호가 일치합니다.' : ''}
                </p>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? '변경 중...' : '변경하기'}
              </button>
            </form>
          </>
        );

      case 'success':
        return (
          <div className={styles.modalContainer}>
            <div className={styles.modal}>
              <div className={styles.modalIcon}>✓</div>
              <h3 className={styles.modalTitle}>변경 완료</h3>
              <p className={styles.modalMessage}>비밀번호가 성공적으로 변경되었습니다.</p>
              <Link to="/login" className={styles.modalBtn}>
                로그인 페이지로 이동
              </Link>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className={styles.errorContainer}>
            <div className={styles.errorCard}>
              <div className={styles.errorIcon}>⚠️</div>
              <h2 className={styles.errorTitle}>오류</h2>
              <p className={styles.errorText}>{error}</p>
              <Link to="/" className={styles.errorBtn}>홈으로 이동</Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}