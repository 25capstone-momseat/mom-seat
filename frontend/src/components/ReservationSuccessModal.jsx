import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ReservationSuccessModal = ({ isOpen, onClose, seat }) => {
  const [reservationNumber, setReservationNumber] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (isOpen && seat) {
      // 랜덤 예약번호 생성
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      setReservationNumber(`#${randomNum}`);
      
      // 현재 시간 설정
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);
    }
  }, [isOpen, seat]);

  if (!isOpen || !seat) {
    return null;
  }

  // 스타일 정의
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
  };

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) translateY(${isOpen ? '0' : '30px'})`,
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '360px',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 20px 60px rgba(125, 96, 115, 0.2)',
    overflow: 'hidden',
  };

  const headerStyle = {
    background: '#7D6073',
    padding: '8px',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerPatternStyle = {
    position: 'absolute',
    width: '120%',
    height: '120%',
    background: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    )`,
    animation: 'stripe 20s linear infinite',
  };

  const bodyStyle = {
    padding: '35px 30px 30px',
  };

  const successCheckStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#FAD0C4',
    margin: '-45px auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 4px 20px rgba(250, 208, 196, 0.4)',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#7D6073',
  };

  const titleStyle = {
    fontSize: '20px',
    color: '#2c2c2c',
    fontWeight: '600',
    marginBottom: '25px',
    textAlign: 'center',
  };

  const detailsStyle = {
    background: '#faf8f9',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
  };

  const detailRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const detailLabelStyle = {
    color: '#9a8591',
    fontSize: '14px',
  };

  const detailValueStyle = {
    color: '#7D6073',
    fontSize: '14px',
    fontWeight: '600',
  };

  const seatValueStyle = {
    ...detailValueStyle,
    fontSize: '16px',
  };

  const dividerStyle = {
    height: '1px',
    background: '#e8e0e5',
    margin: '12px 0',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
  };

  const btnBaseStyle = {
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    textAlign: 'center',
  };

  const btnConfirmStyle = {
    ...btnBaseStyle,
    background: 'white',
    color: '#7D6073',
    border: '2px solid #e8e0e5',
  };

  const btnHistoryStyle = {
    ...btnBaseStyle,
    background: '#7D6073',
    color: 'white',
    width: '100%',
  };

  return (
    <>
      <style>
        {`
          @keyframes stripe {
            0% { transform: translateX(0); }
            100% { transform: translateX(28px); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .modal-success-check {
            animation: fadeInUp 0.4s ease 0.1s both;
          }
          
          .modal-title {
            animation: fadeInUp 0.4s ease 0.15s both;
          }
          
          .modal-details {
            animation: fadeInUp 0.4s ease 0.2s both;
          }
          
          .modal-buttons {
            animation: fadeInUp 0.4s ease 0.25s both;
          }
          
          .btn-confirm:hover {
            background: #faf8f9 !important;
            border-color: #C599B6 !important;
          }
          
          .btn-history:hover {
            background: #6a5162 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(125, 96, 115, 0.3);
          }
        `}
      </style>

      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={headerPatternStyle} />
        </div>
        
        <div style={bodyStyle}>
          <div style={successCheckStyle} className="modal-success-check">
            ✓
          </div>
          
          <h2 style={titleStyle} className="modal-title">
            예약이 완료되었습니다
          </h2>
          
          <div style={detailsStyle} className="modal-details">
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>좌석</span>
              <span style={seatValueStyle}>{seat.row}{seat.number}</span>
            </div>
            
            <div style={dividerStyle} />
            
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>예약번호</span>
              <span style={detailValueStyle}>{reservationNumber}</span>
            </div>
            
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>유효시간</span>
              <span style={detailValueStyle}>30분</span>
            </div>
            
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>예약시간</span>
              <span style={detailValueStyle}>{currentTime}</span>
            </div>
          </div>
          
          <div style={buttonGroupStyle} className="modal-buttons">
            <button 
              style={btnConfirmStyle} 
              className="btn-confirm"
              onClick={onClose}
            >
              확인
            </button>
            <Link to="/reservation-history" style={{ flex: 1 }}>
              <button 
                style={btnHistoryStyle} 
                className="btn-history"
              >
                예약 내역 보기
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationSuccessModal;