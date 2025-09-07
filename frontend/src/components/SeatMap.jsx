import React, { useState, useEffect } from 'react';

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
        // 2,3,4,5는 disabled(회색) 상태 유지
        
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
    // 백엔드 웹소켓 서버 주소
    const ws = new WebSocket('ws://localhost:8000');

    ws.onopen = () => {
      console.log('WebSocket에 연결되었습니다.');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('서버로부터 메시지 수신:', message);

      // 서버로부터 좌석 상태 업데이트 메시지를 받았을 때
      if (message.type === 'SEAT_STATUS_UPDATED') {
        const updatedSeat = message.payload;
        setSeats(prevSeats =>
          prevSeats.map(seat =>
            seat.id === updatedSeat.id ? { ...seat, status: updatedSeat.status } : seat
          )
        );
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 연결이 끊겼습니다.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };

    // 컴포넌트가 언마운트될 때 웹소켓 연결을 정리합니다.
    return () => {
      ws.close();
    };
  }, []);

  // 좌석 클릭 핸들러
  const handleSeatClick = (seatId, status) => {
    // disabled 좌석은 클릭 불가
    if (status === 'disabled' || status === 'occupied') return;
    
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          // 예약 가능한 좌석만 토글
          if (seat.status === 'available') {
            return { ...seat, status: 'reserved' };
          } else if (seat.status === 'reserved') {
            return { ...seat, status: 'available' };
          }
        }
        return seat;
      })
    );
  };

  // 좌석 통계 계산
  const seatStats = {
    total: 12, // 총 좌석 수
    occupied: seats.filter(s => s.status === 'occupied').length,
    available: seats.filter(s => s.status === 'available').length + 
               seats.filter(s => s.status === 'disabled').length // 회색 좌석도 사용 가능으로 표시
  };

  // 좌석 컴포넌트
  const Seat = ({ seat }) => {
    const getColors = () => {
      switch (seat.status) {
        case 'available':
          return { bg: '#C599B6', border: '#C599B6', bottom: '#D9B8CF' };
        case 'reserved':
          return { bg: '#FF6D9C', border: '#FF6D9C', bottom: '#FF8FB3' };
        case 'occupied':
          return { bg: '#F0ADC6', border: '#F0ADC6', bottom: '#F5C4D6' };
        case 'disabled':
          return { bg: '#8F8F8F', border: '#8F8F8F', bottom: '#A8A8A8' };
        default:
          return { bg: '#8F8F8F', border: '#8F8F8F', bottom: '#A8A8A8' };
      }
    };

    const colors = getColors();
    const isClickable = seat.status === 'available' || seat.status === 'reserved';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          onClick={() => handleSeatClick(seat.id, seat.status)}
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: colors.bg,
            border: `2px solid ${colors.border}`,
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isClickable ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            opacity: isClickable ? 1 : 0.7
          }}
          onMouseEnter={(e) => {
            if (isClickable) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (isClickable) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {seat.number}
        </div>
        <div
          style={{
            width: '48px',
            height: '6px',
            backgroundColor: colors.bottom,
            borderRadius: '0 0 4px 4px'
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 좌석 통계 */}
      <div style={{
        backgroundColor: '#FDF8FC',
        border: '2px solid #E6D4E1',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid #E6D4E1'
          }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>총 좌석</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{seatStats.total}</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid #E6D4E1'
          }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>사용 중</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{seatStats.occupied}</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid #E6D4E1'
          }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>사용가능한 좌석</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{seatStats.available}</div>
          </div>
        </div>
      </div>

      {/* 좌석 배치도 */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #E6D4E1',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px'
        }}>
          실시간 좌석 배치도
        </div>

        {/* 좌석 그리드 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {['A', 'B'].map(row => (
            <div key={row} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '24px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#666',
                fontSize: '16px'
              }}>
                {row}
              </span>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {seats
                  .filter(seat => seat.row === row)
                  .map(seat => (
                    <Seat key={seat.id} seat={seat} />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #E6D4E1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#C599B6',
              borderRadius: '6px 6px 0 0',
              border: '2px solid #C599B6'
            }} />
            <span style={{ fontSize: '13px', color: '#666' }}>예약 가능</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#F0ADC6',
              borderRadius: '6px 6px 0 0',
              border: '2px solid #F0ADC6'
            }} />
            <span style={{ fontSize: '13px', color: '#666' }}>사용중인 좌석</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#FF6D9C',
              borderRadius: '6px 6px 0 0',
              border: '2px solid #FF6D9C'
            }} />
            <span style={{ fontSize: '13px', color: '#666' }}>예약된 좌석</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;