import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../../styles/modules/SeatMap.module.css';
import { getSeats } from '../services/seatService';
import { createReservation } from '../services/reservationService';
import ReservationSuccessModal from './ReservationSuccessModal';

// Vite 환경변수 사용
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SeatMap = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, seat: null });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const seatsData = await getSeats();
      
      console.log('🔍 백엔드에서 받은 원본 데이터:', seatsData);
      
      // 데이터 검증
      if (!Array.isArray(seatsData)) {
        throw new Error('좌석 데이터 형식이 올바르지 않습니다.');
      }
      
      // 데이터 정규화 - seatNumber를 숫자로 변환
      // isPregnantSeat는 백엔드 데이터를 그대로 사용
      const normalizedSeats = seatsData.map(seat => ({
        id: seat.id || seat._id,
        row: seat.row || 'A',
        number: typeof seat.seatNumber === 'number' 
          ? seat.seatNumber 
          : parseInt(seat.seatNumber) || parseInt(seat.number) || 1,
        status: seat.status || 'vacant',
        isPregnantSeat: seat.isPregnantSeat || false  // DB에서 오는 값 그대로 사용
      }));
      
      // 정렬
      const sortedSeats = normalizedSeats.sort((a, b) => {
        if (a.row < b.row) return -1;
        if (a.row > b.row) return 1;
        return a.number - b.number;
      });
      
      console.log('✅ 최종 좌석 데이터:', sortedSeats);
      console.log('   임산부석 위치:', sortedSeats.filter(s => s.isPregnantSeat).map(s => `${s.row}${s.number}`).join(', '));
      
      setSeats(sortedSeats);
    } catch (error) {
      console.error('Failed to fetch seats:', error);
      setError('좌석 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      console.log('WebSocket 연결 시도:', WS_URL);
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('✅ WebSocket 연결 성공');
        setError(null);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📩 서버 메시지:', message);

          if (message.type === 'SEAT_STATUS_UPDATED') {
            const updatedSeat = message.payload;
            
            setSeats(prevSeats =>
              prevSeats.map(seat =>
                seat.id === updatedSeat.id 
                  ? { ...seat, status: updatedSeat.status } 
                  : seat
              )
            );
          }
        } catch (err) {
          console.error('WebSocket 메시지 파싱 오류:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket 연결 종료');
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket 에러:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket 생성 실패:', err);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchSeats, connectWebSocket]);

  const handleSeatClick = async (seat) => {
    // 임산부석이 아닌 경우 예약 불가
    if (!seat.isPregnantSeat) {
      alert('임산부 전용석만 예약 가능합니다.');
      return;
    }

    if (seat.status !== 'vacant') {
      alert('이미 사용 중이거나 예약된 좌석입니다.');
      return;
    }

    try {
      await createReservation(seat.id);
      setModalInfo({ isOpen: true, seat: seat });
      
      // 낙관적 업데이트
      setSeats(prevSeats =>
        prevSeats.map(s =>
          s.id === seat.id ? { ...s, status: 'occupied' } : s
        )
      );
      
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('예약에 실패했습니다.');
      fetchSeats();
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ isOpen: false, seat: null });
    fetchSeats();
  };

  const seatStats = {
    total: seats.filter(s => s.isPregnantSeat).length,
    occupied: seats.filter(s => s.isPregnantSeat && s.status === 'occupied').length,
    available: seats.filter(s => s.isPregnantSeat && s.status === 'vacant').length,
    reserved: seats.filter(s => s.isPregnantSeat && s.status === 'occupied').length,
  };

  const SubwaySeat = ({ seat }) => {
    const isClickable = seat.isPregnantSeat && seat.status === 'vacant';
    
    // 상태별 클래스 결정
    let statusClass = '';
    let bottomStatusClass = '';
    
    if (seat.isPregnantSeat) {
      // 임산부석
      statusClass = styles[`status${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}`];
      bottomStatusClass = styles[`status${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}Bottom`];
    } else {
      // 일반석 (회색으로 표시)
      statusClass = styles.statusDisabled;
      bottomStatusClass = styles.statusDisabledBottom;
    }

    return (
      <div className={styles.seatWrapper}>
        <div
          onClick={() => handleSeatClick(seat)}
          className={`${styles.seatTop} ${statusClass} ${isClickable ? styles.clickable : styles.notClickable}`}
          title={seat.isPregnantSeat ? `임산부석 ${seat.row}${seat.number}` : '일반 좌석'}>
          {seat.isPregnantSeat ? (
            <>
              <div style={{ fontSize: '20px' }}>🤰</div>
              <div style={{ fontSize: '12px' }}>{seat.number}</div>
            </>
          ) : (
            <div style={{ fontSize: '14px' }}>{seat.number}</div>
          )}
        </div>
        <div className={`${styles.seatBottom} ${bottomStatusClass}`} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.seatMapContainer}>
        <div className={styles.loadingContainer}>
          좌석 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  const rows = ['A', 'B'];

  return (
    <div className={styles.seatMapContainer}>
      <ReservationSuccessModal 
        isOpen={modalInfo.isOpen}
        onClose={handleCloseModal}
        seat={modalInfo.seat}
      />
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>임산부석</div>
            <div className={styles.statValue}>{seatStats.total}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>사용 중</div>
            <div className={styles.statValue}>{seatStats.occupied}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>예약 가능</div>
            <div className={styles.statValue}>{seatStats.available}</div>
          </div>
        </div>
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapTitle}>
          🚇 지하철 임산부석 배치도
          {wsRef.current?.readyState === WebSocket.OPEN && (
            <span className={styles.liveIndicator}> 🟢 실시간</span>
          )}
        </div>
        
        <div className={styles.subwaySeatsContainer}>
          <div className={styles.gridContainer}>
            {rows.map(row => (
              <div key={row} className={styles.row}>
                <div className={styles.seatsContainer}>
                  {seats
                    .filter(seat => seat.row === row)
                    .map(seat => <SubwaySeat key={seat.id} seat={seat} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div style={{ fontSize: '20px' }}>🤰</div>
            <span className={styles.legendLabel}>임산부 전용석</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusVacant}`} />
            <span className={styles.legendLabel}>예약 가능</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusOccupied}`} />
            <span className={styles.legendLabel}>예약됨</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColorBox} ${styles.statusDisabled}`} />
            <span className={styles.legendLabel}>일반 좌석</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;