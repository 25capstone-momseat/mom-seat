import React, { useState, useEffect } from 'react';
import styles from '../../styles/modules/SeatMap.module.css';

const SeatMap = () => {
  // 좌석 데이터 초기화 (2행 6열)
  const initializeSeats = () => {
    const seatData = [];
    const rows = ['A', 'B'];
    
    for (let row of rows) {
      for (let i = 1; i <= 6; i++) {
        let status = 'disabled'; // 기본값: 회색(비활성)
        
        // 좌석 상태 설정
        if (i === 1) {
          if (row === 'A') {
            status = 'occupied';  // A1: 사용중 (연분홍)
          } else {
            status = 'available'; // B1: 예약 가능 (연보라)
          }
        } else if (i === 6) {
          if (row === 'A') {
            status = 'reserved';  // A6: 예약됨 (진분홍)
          } else {
            status = 'available'; // B6: 예약 가능 (연보라)
          }
        }
        
        seatData.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          status: status
        });
      }
    }
    return seatData;
  };

  const [seats, setSeats] = useState(initializeSeats());

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');

    ws.onopen = () => console.log('WebSocket에 연결되었습니다.');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('서버로부터 메시지 수신:', message);

      if (message.type === 'SEAT_STATUS_UPDATED') {
        const updatedSeat = message.payload;
        setSeats(prevSeats =>
          prevSeats.map(seat =>
            seat.id === updatedSeat.id ? { ...seat, status: updatedSeat.status } : seat
          )
        );
      }
    };

    ws.onclose = () => console.log('WebSocket 연결이 끊겼습니다.');
    ws.onerror = (error) => console.error('WebSocket 에러:', error);

    return () => ws.close();
  }, []);

  const handleSeatClick = (seatId, status) => {
    if (status === 'disabled' || status === 'occupied') return;
    
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          if (seat.status === 'available') return { ...seat, status: 'reserved' };
          if (seat.status === 'reserved') return { ...seat, status: 'available' };
        }
        return seat;
      })
    );
  };

  const seatStats = {
    total: 12,
    occupied: seats.filter(s => s.status === 'occupied').length,
    available: seats.filter(s => s.status === 'available' || s.status === 'disabled').length
  };

  const Seat = ({ seat }) => {
    const isClickable = seat.status === 'available' || seat.status === 'reserved';
    
    const statusClass = styles[`status${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}`];
    const bottomStatusClass = styles[`status${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}Bottom`];

    return (
      <div className={styles.seatWrapper}>
        <div
          onClick={() => handleSeatClick(seat.id, seat.status)}
          className={`${styles.seatTop} ${statusClass} ${isClickable ? styles.clickable : styles.notClickable}`}>
          {seat.number}
        </div>
        <div className={`${styles.seatBottom} ${bottomStatusClass}`} />
      </div>
    );
  };

  return (
    <div className={styles.seatMapContainer}>
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>총 좌석</div>
            <div className={styles.statValue}>{seatStats.total}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>사용 중</div>
            <div className={styles.statValue}>{seatStats.occupied}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>사용가능한 좌석</div>
            <div className={styles.statValue}>{seatStats.available}</div>
          </div>
        </div>
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapTitle}>실시간 좌석 배치도</div>
        <div className={styles.gridContainer}>
          {['A', 'B'].map(row => (
            <div key={row} className={styles.row}>
              <span className={styles.rowLabel}>{row}</span>
              <div className={styles.seatsContainer}>
                {seats
                  .filter(seat => seat.row === row)
                  .map(seat => <Seat key={seat.id} seat={seat} />)}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusAvailable}`} />
            <span className={styles.legendLabel}>예약 가능</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusOccupied}`} />
            <span className={styles.legendLabel}>사용중인 좌석</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusReserved}`} />
            <span className={styles.legendLabel}>예약된 좌석</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
