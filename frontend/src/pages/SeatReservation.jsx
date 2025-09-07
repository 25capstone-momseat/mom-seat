import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SeatMap from '../components/SeatMap'; // SeatMap 컴포넌트를 import 합니다.

const SeatReservation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  // ... (다른 상태 변수들은 그대로 유지)
  const [isLoading, setIsLoading] = useState(false);

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

  // ... (handleReservation, handleCancel 등 다른 핸들러는 그대로 유지)

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // ... (Step 1 내용은 그대로 유지)
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">현재 예약 좌석</h2>
            {/* ... Step 1의 나머지 내용 ... */}
          </div>
        );

      case 2:
        // ... (Step 2 내용은 그대로 유지)
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">맘편한 자리</h2>
            {/* ... Step 2의 나머지 내용 ... */}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">실시간 좌석 조회</h2>
            <div className="bg-pink-100 rounded-lg p-6">
              {/* 기존 좌석 조회 로직 대신 SeatMap 컴포넌트를 렌더링합니다. */}
              <SeatMap />
            </div>
            <button
              onClick={handleNext}
              className="w-full mt-6 py-4 bg-pink-400 text-white rounded-lg font-bold hover:bg-pink-500"
            >
              다음 단계
            </button>
          </div>
        );

      case 4:
        // ... (Step 4 내용은 그대로 유지)
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-purple-700 mb-6">예약 확인</h2>
            {/* ... Step 4의 나머지 내용 ... */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-purple-700">
            {currentStep === 1 ? '현재 예약 좌석' : '맘편한 자리'}
          </h1>
          <div className="w-6" />
        </div>

        {renderStepContent()}

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