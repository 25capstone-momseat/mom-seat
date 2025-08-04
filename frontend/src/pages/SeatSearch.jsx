import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const SeatSearch = () => {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedTrain, setSelectedTrain] = useState('');
  const [selectedCarNumber, setSelectedCarNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // 좌석 배치 데이터
  const seatLayout = {
    rows: 2,
    columns: 6,
    seats: [
      { id: 'A1', row: 0, col: 0, type: 'pregnant' },
      { id: 'A2', row: 0, col: 1, type: 'general' },
      { id: 'A3', row: 0, col: 2, type: 'general' },
      { id: 'A4', row: 0, col: 3, type: 'general' },
      { id: 'A5', row: 0, col: 4, type: 'general' },
      { id: 'A6', row: 0, col: 5, type: 'selected' },
      { id: 'B1', row: 1, col: 0, type: 'booked' },
      { id: 'B2', row: 1, col: 1, type: 'general' },
      { id: 'B3', row: 1, col: 2, type: 'general' },
      { id: 'B4', row: 1, col: 3, type: 'general' },
      { id: 'B5', row: 1, col: 4, type: 'general' },
      { id: 'B6', row: 1, col: 5, type: 'pregnant' }
    ]
  };

  const handleSelectOption = (option, type) => {
    switch(type) {
      case 'line':
        setSelectedLine(option);
        break;
      case 'train':
        setSelectedTrain(option);
        break;
      case 'car':
        setSelectedCarNumber(option);
        break;
    }
  };

  const handleReservation = () => {
    console.log('예약하기 클릭');
    // 실제로는 navigate('/seat-reservation/confirm')
  };

  const getSeatColor = (type) => {
    switch (type) {
      case 'pregnant':
        return '#E6B3D5';
      case 'selected':
        return '#FF69B4';
      case 'booked':
        return '#FFB6C1';
      case 'general':
      default:
        return '#9B9B9B';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      {/* 헤더 */}
      <div className="text-center py-4 px-6">
        <h1 className="text-xl font-bold" style={{ color: '#C599B6' }}>
          맘편한 자리
        </h1>
      </div>

      {/* 섹션 헤더 */}
      <div className="px-6 py-4" style={{ backgroundColor: '#F5C9C6' }}>
        <h2 className="text-lg font-bold">실시간 좌석 조회</h2>
      </div>

      {/* 선택 옵션들 */}
      <div className="px-6 py-4 space-y-3">
        <button
          onClick={() => handleSelectOption('노선', 'line')}
          className="w-full p-4 bg-white rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
          style={{ border: '1px solid #E0E0E0' }}
        >
          <span className="text-lg">노선 선택</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => handleSelectOption('행', 'train')}
          className="w-full p-4 bg-white rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
          style={{ border: '1px solid #FFB6C1' }}
        >
          <span className="text-lg">행 선택</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => handleSelectOption('열차번호', 'car')}
          className="w-full p-4 bg-white rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
          style={{ border: '1px solid #E0E0E0' }}
        >
          <span className="text-lg">열차번호 선택</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 열차 정보 */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold">5호선</span>
            <span className="text-xl">5676열차</span>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            2025-03-31(월) | 19:32:00 | 3-1
          </div>

          {/* 좌석 통계 */}
          <div className="flex space-x-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
              총 좌석 4
            </span>
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
              사용 중 1
            </span>
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
              사용가능한 좌석 2
            </span>
          </div>

          {/* 좌석 배치도 */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="grid grid-cols-6 gap-2">
              {seatLayout.seats.map((seat) => (
                <div
                  key={seat.id}
                  className="h-12 rounded-lg"
                  style={{ backgroundColor: getSeatColor(seat.type) }}
                />
              ))}
            </div>
          </div>

          {/* 범례 */}
          <div className="flex justify-center mt-4 space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#9B9B9B' }} />
              <span>예약 가능</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FFB6C1' }} />
              <span>사용중인 좌석</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FF69B4' }} />
              <span>예약된 좌석</span>
            </div>
          </div>
        </div>
      </div>

      {/* 예약하기 버튼 */}
      <div className="px-6 py-4">
        <button
          onClick={handleReservation}
          className="w-full py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
          style={{ backgroundColor: '#F5C9C6' }}
        >
          예약하기
        </button>
      </div>
    </div>
  );
};

export default SeatSearch;