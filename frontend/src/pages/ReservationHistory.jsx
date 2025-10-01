import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import styles from '../../styles/modules/ReservationHistory.module.css';
import { useAuth } from '../hooks/useAuth';
import { getReservations, cancelReservation } from '../services/reservationService';

const ReservationHistory = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getReservations();
        setReservations(data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('예약 내역을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [currentUser]);

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('정말로 예약을 취소하시겠습니까?')) {
      try {
        await cancelReservation(reservationId);
        setReservations(reservations.filter(r => r.id !== reservationId));
        alert('예약이 성공적으로 취소되었습니다.');
      } catch (err) {
        console.error('Error canceling reservation:', err);
        alert('예약 취소에 실패했습니다.');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };

    let date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (typeof timestamp._seconds === 'number') {
      date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    } else if (typeof timestamp.seconds === 'number') {
      date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    } else {
      return { date: '', time: '' };
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReservationNavigate = () => {
    navigate('/subway'); // 지하철 노선도 페이지로 이동
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'reserved':
        return { text: '예약 완료', color: '#b77fa5ff' };
      case 'completed':
        return { text: '이용 완료', color: '#589550' };
      case 'cancelled':
        return { text: '예약 취소', color: '#B22D2D' };
      default:
        return { text: status, color: '#333' };
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          onClick={handleBack}
          className={styles.backButton}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Title */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>좌석 이용 내역</h1>
      </div>

      {/* Reservation List */}
      <div className={styles.listContainer}>
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : reservations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Calendar size={48} />
            </div>
            <p className={styles.emptyText}>예약 내역이 없습니다</p>
            <button 
              className={styles.reservationButton}
              onClick={handleReservationNavigate}
            >
              좌석 예약하러 가기
            </button>
          </div>
        ) : (
          reservations.map((reservation) => {
            const { date, time } = formatDate(reservation.reservedAt);
            const statusInfo = getStatusInfo(reservation.status);
            const isCancelable = reservation.status === 'reserved';

            return (
              <div 
                key={reservation.id}
                className={`${styles.card} ${isCancelable ? styles.cancelable : ''}`}
                onClick={() => isCancelable && handleCancelReservation(reservation.id)}
              >
                <div className={styles.seatContainer}>
                  <p className={styles.dateTime}>{`${date} - ${time}`}</p>
                  <div className={styles.seatNumber}>
                    {reservation.seatId} {/* 우선 seatId를 표시 */}
                  </div>
                  <div 
                    className={styles.status}
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReservationHistory;