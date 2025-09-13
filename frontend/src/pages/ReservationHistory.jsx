import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styles from '../../styles/modules/ReservationHistory.module.css';

const SeatReservation = () => {
  const navigate = useNavigate();
  const [reservations] = useState([
    {
      date: '2025-03-01',
      time: '14:05',
      seat: '5번 좌석',
      status: '이용 완료',
      statusColor: '#589550',
      agency: '1호선 인천행',
      trainNumber: '7235열차'
    },
    {
      date: '2025-03-13',
      time: '11:16',
      seat: '2번 좌석',
      status: '예약 취소',
      statusColor: '#B22D2D',
      agency: '5호선 방화행',
      trainNumber: '5606열차'
    },
    {
      date: '2025-03-25',
      time: '15:53',
      seat: '1번 좌석',
      status: '이용 완료',
      statusColor: '#589550',
      agency: '2호선 외선순환',
      trainNumber: '2297열차'
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBack = () => {
    navigate(-1);
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
        {reservations.map((reservation, index) => (
          <div 
            key={index}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.dateTime}>{formatDate(reservation.date)}</p>
                <p className={styles.dateTime}>{reservation.time}</p>
              </div>
              <div className={styles.rightAlign}>
                <p className={styles.dateTime}>{reservation.agency}</p>
                <p className={styles.dateTime}>{reservation.trainNumber}</p>
              </div>
            </div>
            
            <div className={styles.seatContainer}>
              <div className={styles.seatNumber}>
                {reservation.seat}
              </div>
              <div 
                className={styles.status}
                style={{ color: reservation.statusColor }}
              >
                {reservation.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatReservation;