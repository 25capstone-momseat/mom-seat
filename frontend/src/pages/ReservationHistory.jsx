import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const SeatReservation = () => {
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
    console.log('뒤로가기');
  };

  // 인라인 스타일로 모든 스타일 직접 정의
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#FFF7F3',
      padding: 0,
      margin: 0
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px'
    },
    backButton: {
      padding: '8px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'background 0.2s'
    },
    titleContainer: {
      textAlign: 'center',
      padding: '24px 0'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#7D6073',
      margin: 0
    },
    listContainer: {
      padding: '0 24px 32px 24px'
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.3s'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    dateTime: {
      color: '#374151',
      fontSize: '16px',
      margin: '2px 0'
    },
    seatContainer: {
      textAlign: 'center',
      padding: '24px 0'
    },
    seatNumber: {
      fontSize: '38px',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '16px'
    },
    status: {
      fontSize: '20px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button 
          onClick={handleBack}
          style={styles.backButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Title */}
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>좌석 이용 내역</h1>
      </div>

      {/* Reservation List */}
      <div style={styles.listContainer}>
        {reservations.map((reservation, index) => (
          <div 
            key={index}
            style={styles.card}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
          >
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.dateTime}>{formatDate(reservation.date)}</p>
                <p style={styles.dateTime}>{reservation.time}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={styles.dateTime}>{reservation.agency}</p>
                <p style={styles.dateTime}>{reservation.trainNumber}</p>
              </div>
            </div>
            
            <div style={styles.seatContainer}>
              <div style={styles.seatNumber}>
                {reservation.seat}
              </div>
              <div style={{ ...styles.status, color: reservation.statusColor }}>
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