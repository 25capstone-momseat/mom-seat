import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import styles from '../../styles/modules/Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      alert('로그아웃에 실패했습니다: ' + (e.message || ''));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* 로고 */}
        <Link to="/" className={styles.logo}>
          맘편한자리
        </Link>

        {/* 데스크톱 메뉴 */}
        <ul className={styles.navMenu}>
          {!loading && !user && (
            <>
              <li>
                <Link to="/login" className={styles.navItem}>
                  로그인
                </Link>
              </li>
              <li>
                <Link to="/signup" className={styles.navItem}>
                  회원가입
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/ocr" className={styles.navItem}>
              임신확인서
            </Link>
          </li>
          {user && (
            <li>
              {/* TODO: 내 정보 관리 페이지 라우트 추가 필요 */}
              <Link to="/profile" className={styles.navItem}>
                내 정보 관리
              </Link>
            </li>
          )}
        </ul>

        {/* 오른쪽 액션 그룹 */}
        <div className={styles.rightActions}>
          {/* 액션 버튼들 */}
          <div className={styles.navActions}>
            <Link to="/" className={`${styles.navButton} ${styles.outline}`}>
              홈으로
            </Link>
            
            {!loading && (
              user ? (
                <button 
                  onClick={onLogout} 
                  className={`${styles.navButton} ${styles.primary}`}
                >
                  로그아웃
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className={`${styles.navButton} ${styles.primary}`}
                >
                  로그인
                </Link>
              )
            )}
          </div>

          {/* 햄버거 메뉴 버튼 */}
          <div 
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ''}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <ul className={styles.mobileMenuList}>
          {!loading && !user && (
            <>
              <li>
                <Link 
                  to="/login" 
                  className={styles.mobileMenuItem}
                  onClick={closeMobileMenu}
                >
                  로그인
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className={styles.mobileMenuItem}
                  onClick={closeMobileMenu}
                >
                  회원가입
                </Link>
              </li>
            </>
          )}
          <li>
            <Link 
              to="/ocr" 
              className={styles.mobileMenuItem}
              onClick={closeMobileMenu}
            >
              임신확인서
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link 
                  to="/profile" 
                  className={styles.mobileMenuItem}
                  onClick={closeMobileMenu}
                >
                  내 정보 관리
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onLogout();
                    closeMobileMenu();
                  }}
                  className={styles.mobileMenuItem}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  로그아웃
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}