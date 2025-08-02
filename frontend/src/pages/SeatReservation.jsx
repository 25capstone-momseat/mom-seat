import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SeatReservation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedFloorNumber, setSelectedFloorNumber] = useState(3);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 더미 데이터
  const departments = ['노선 선택', '출발역', '도착역', '날짜 및 시간'];
  const areas = ['임산부 좌석 예약'];
  const floors = ['노선 선택', '행 선택', '열차번호 선택'];
  const durations = ['1시간', '2시간', '3시간', '4시간'];

  // 좌석 배치 데이터 (3번 칸 기준)
  const seatLayout = {
    rows: 2,
    columns: 6,
    seats: [
      { id: 'A1', row: 0, col: 0, type: 'available' },
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
      { id: 'B6', row: 1, col: 5, type: 'booked' }
    ]
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReservation = async () => {
    setIsLoading(true);
    // API 호출 로직
    setTimeout(() => {
      setIsLoading(false);
      alert('예약이 완료되었습니다!');
      // 홈으로 이동 또는 예약 완료 화면으로 이동
    }, 1500);
  };

  const handleCancel = async () => {
    setIsLoading(true);
    // API 호출 로직
    setTimeout(() => {
      setIsLoading(false);
      alert('예약이 취소되었습니다!');
      setCurrentStep(1);
    }, 1500);
  };

  const getSeatColor = (type) => {
    switch (type) {
      case 'available':
        return 'bg-pink-300';
      case 'selected':
        return 'bg-pink-500';
      case 'booked':
        return 'bg-purple-300';
      default:
        return 'bg-gray-400';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">현재 예약 좌석</h2>
            <div className="bg-pink-100 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="text-lg">
                  <p className="font-bold">2025-03-31</p>
                  <p>15:53</p>
                </div>
                <div className="text-right">
                  <p>7호선 장암행</p>
                  <p>7224열차</p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-4 bg-pink-400 text-white rounded-lg font-bold text-lg hover:bg-pink-500"
                >
                  취소되었습니다
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full py-3 bg-pink-200 text-gray-700 rounded-lg hover:bg-pink-300"
                >
                  좌석 예약 취소하기
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">맘편한 자리</h2>
            <div className="bg-pink-100 rounded-lg p-6">
              <h3 className="font-bold mb-4">임산부 좌석 예약</h3>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      if (index === departments.length - 1) {
                        handleNext();
                      }
                    }}
                    className="w-full p-4 bg-white rounded-lg flex justify-between items-center hover:bg-gray-50"
                  >
                    <span>{dept}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold mb-2">지하철 칸 선택</h4>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedFloorNumber(num)}
                      className={`px-4 py-2 rounded ${
                        selectedFloorNumber === num ? 'bg-pink-400 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-2">좌석 배치도 (3번 칸)</h4>
                <div className="bg-white p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-2">
                    {seatLayout.seats.map((seat) => (
                      <div
                        key={seat.id}
                        className={`h-12 rounded ${getSeatColor(seat.type)}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded mr-2" />
                      <span>예약 가능</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-300 rounded mr-2" />
                      <span>선택한 좌석</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-500 rounded mr-2" />
                      <span>예약된 좌석</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-6 py-4 bg-pink-400 text-white rounded-lg font-bold hover:bg-pink-500"
              >
                예약하기
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">맘편한 자리</h2>
            <div className="bg-pink-100 rounded-lg p-6">
              <h3 className="font-bold mb-4">실시간 좌석 조회</h3>
              <div className="space-y-3">
                {floors.map((floor, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedFloor(floor);
                    }}
                    className="w-full p-4 bg-white rounded-lg flex justify-between items-center hover:bg-gray-50"
                  >
                    <span>{floor}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ))}
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">5호선</span>
                  <span>5676열차</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">2025-03-31(월) | 19:32:00 | 3-1</p>
                <div className="flex space-x-4 text-sm">
                  <span className="bg-purple-200 px-2 py-1 rounded">총 좌석 4</span>
                  <span className="bg-purple-200 px-2 py-1 rounded">사용 중 1</span>
                  <span className="bg-purple-200 px-2 py-1 rounded">사용가능한 좌석 2</span>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-6 gap-2">
                    {seatLayout.seats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => {
                          if (seat.type !== 'booked') {
                            setSelectedSeat(seat.id);
                            handleNext();
                          }
                        }}
                        disabled={seat.type === 'booked'}
                        className={`h-12 rounded ${getSeatColor(
                          selectedSeat === seat.id ? 'selected' : seat.type
                        )} ${seat.type !== 'booked' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-6 py-4 bg-pink-400 text-white rounded-lg font-bold hover:bg-pink-500"
              >
                예약하기
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">예약 확인</h2>
            <div className="bg-pink-100 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-pink-300 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">좌석 예약하기</h3>
                </div>
                <div className="bg-purple-300 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">예약 취소하기</h3>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-purple-700">
            {currentStep === 1 ? '현재 예약 좌석' : '맘편한 자리'}
          </h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        {renderStepContent()}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-lg">처리 중입니다...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatReservation;