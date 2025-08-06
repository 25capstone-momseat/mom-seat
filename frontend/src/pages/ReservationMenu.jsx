import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ReservationMenu = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 페이지로
  };

  const handleReservation = () => {
    navigate('/subway'); // SubwayDashboard 페이지로
  };

  const handleCancel = () => {
    navigate('/seat-reservation/cancel'); // 예약 취소 페이지로
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      {/* 상단 헤더 */}
      <div className="flex items-center p-4">
        <button onClick={handleBack} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="w-full max-w-md space-y-6">
          {/* 좌석 예약하기 버튼 */}
          <button
            onClick={handleReservation}
            className="w-full py-24 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            style={{ backgroundColor: '#F5C9C6' }}
          >
            <h2 className="text-3xl font-bold text-gray-800">
              좌석 예약하기
            </h2>
          </button>

          {/* 예약 취소하기 버튼 */}
          <button
            onClick={handleCancel}
            className="w-full py-24 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            style={{ backgroundColor: '#E6B3D5' }}
          >
            <h2 className="text-3xl font-bold text-gray-800">
              예약 취소하기
            </h2>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationMenu;