import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styles from '../../styles/modules/ReservationMenu.module.css';

const ReservationMenu = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 페이지로
  };

  const handleReservation = () => {
    navigate('/subway'); // SubwayDashboard 페이지로
  };

  const handleCancel = () => {
    navigate('/reservation-history'); // 예약 내역 페이지로 (취소 기능 포함)
  };

  return (
    <div className={styles.pageContainer}>
      {/* 뒤로가기 버튼 */}
      <button onClick={handleBack} className={styles.backButton}>
        <ChevronLeft className={styles.backIcon} />
      </button>

      {/* 메인 컨테이너 */}
      <div className={styles.container}>
        {/* 좌석 예약하기 버튼 */}
        <button
          onClick={handleReservation}
          className={`${styles.button} ${styles.buttonReserve}`}
        >
          좌석 예약하기
        </button>

        {/* 예약 취소하기 버튼 */}
        <button
          onClick={handleCancel}
          className={`${styles.button} ${styles.buttonCancel}`}
        >
          예약 취소하기
        </button>
      </div>
    </div>
  );
};

export default ReservationMenu;