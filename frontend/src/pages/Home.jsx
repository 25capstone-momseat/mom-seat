import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, CheckSquare, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../config/api';
import styles from '../../styles/modules/Home.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, name, loading } = useAuth();
  
  const userName =
    (typeof name === 'string' && name.trim()) ||
    (user?.displayName && user.displayName.trim()) ||
    '사용자';

  const [certOpen, setCertOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState('');
  const [cert, setCert] = useState(null);

  async function openCertificate() {
    setCertOpen(true);
    setCertLoading(true);
    setCertError('');
    setCert(null);
    try {
      const { data } = await api.get('/certificate/me');
      setCert(data?.certificate || null);
      if (!data?.certificate) {
        setCertError('저장된 임신확인서가 없습니다. OCR에서 먼저 업로드/인식해주세요.');
      }
    } catch {
      setCertError('인증서 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setCertLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('certJustUpdated') === '1') {
      localStorage.removeItem('certJustUpdated');
      openCertificate();
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더/로고 영역 */}
      <div className={styles.header}>
        <h1 className={styles.logo}>
          <span className={styles.logoMam}>맘</span>
          <span className={styles.logoPyeon}>편한자리</span>
        </h1>
      </div>

      {/* 임신확인서 보기 카드 */}
      <div className={styles.certCardWrapper}>
        <div className={styles.certCard} onClick={openCertificate}>
          <div className={styles.certCardContent}>
            <div className={styles.certCardLeft}>
              <div className={styles.certIconBox}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className={styles.certText}>내 임신확인서 보기</span>
            </div>
          </div>
        </div>
      </div>

      {/* 환영 메시지 */}
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>안녕하세요, {userName} 님!</h2>
        <div className={styles.certStatus}>
          <span>임산부 인증 완료</span>
          <div className={styles.checkIcon}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 메인 기능 그리드 */}
      <div className={styles.menuGrid}>
        {/* 실시간 좌석 조회 */}
        <button 
          className={styles.menuButton}
          onClick={() => navigate('/seat-search')}
        >
          <div className={styles.menuContent}>
            <div className={styles.menuIconBox}>
              <MapPin className={styles.menuIcon} />
            </div>
            <div className={styles.menuTitle}>
              실시간<br />좌석 조회
            </div>
          </div>
        </button>

        {/* 좌석 예약 & 취소 */}
        <button 
          className={styles.menuButton}
          onClick={() => navigate('/reservation')}
        >
          <div className={styles.menuContent}>
            <div className={styles.menuIconBox}>
              <Search className={styles.menuIcon} />
            </div>
            <div className={styles.menuTitle}>
              좌석<br />예약 & 취소
            </div>
          </div>
        </button>

        {/* 좌석 이용 내역 */}
        <button 
          className={styles.menuButton}
          onClick={() => navigate('/reservation-history')}
        >
          <div className={styles.menuContent}>
            <div className={styles.menuIconBox}>
              <CheckSquare className={styles.menuIcon} />
            </div>
            <div className={styles.menuTitle}>
              좌석 이용 내역
            </div>
          </div>
        </button>

        {/* 내 정보 관리 */}
        <button 
          className={styles.menuButton}
          onClick={() => navigate('/profile')}
        >
          <div className={styles.menuContent}>
            <div className={styles.menuIconBox}>
              <User className={styles.menuIcon} />
            </div>
            <div className={styles.menuTitle}>
              내 정보 관리
            </div>
          </div>
        </button>
      </div>

      {/* 인증서 모달 */}
      {certOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>내 임신확인서</h3>
              <button onClick={() => setCertOpen(false)} className={styles.modalCloseButton}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>

            {certLoading ? (
              <div className={styles.modalLoading}>불러오는 중…</div>
            ) : certError ? (
              <div className={styles.modalError}>{certError}</div>
            ) : (
              <div className={styles.modalInfoList}>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalInfoLabel}>산모이름</span>
                  <span className={styles.modalInfoValue}>{cert?.name || '-'}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalInfoLabel}>병원</span>
                  <span className={styles.modalInfoValue}>{cert?.hospital || '-'}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalInfoLabel}>발급일자</span>
                  <span className={styles.modalInfoValue}>{cert?.issueDate || '-'}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalInfoLabel}>예정일</span>
                  <span className={styles.modalInfoValue}>{cert?.dueDate || '-'}</span>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                onClick={() => navigate('/ocr')}
                className={styles.modalActionButton}
              >
                재업로드/OCR 다시하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;