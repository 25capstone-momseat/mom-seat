import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function ReservationHistory() {
  const reservations = [
    {
      date: '2025-03-01',
      time: '14:05',
      hall: '1호선 인천행',
      carNumber: 7235,
      seat: '5번 좌석',
      status: '이용 완료',
      statusColor: 'text-green-600'
    },
    {
      date: '2025-03-13',
      time: '11:16',
      hall: '5호선 방화행',
      carNumber: 5606,
      seat: '2번 좌석',
      status: '예약 취소',
      statusColor: 'text-red-600'
    },
    {
      date: '2025-03-25',
      time: '15:53',
      hall: '2호선 외선순환',
      carNumber: 2297,
      seat: '1번 좌석',
      status: '이용 완료',
      statusColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-pink-50 px-4 pb-8 pt-4">
        <div className="flex items-center mb-6">
          <ChevronLeft className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-center text-purple-700">
          좌석 이용 내역
        </h1>
      </div>

      {/* Reservation List */}
      <div className="px-4 -mt-4">
        {reservations.map((reservation, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm mb-4 p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-gray-700 text-sm mb-1">
                  {reservation.date}
                </div>
                <div className="text-gray-700 text-sm">
                  {reservation.time}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-700 text-sm mb-1">
                  {reservation.hall}
                </div>
                <div className="text-gray-700 text-sm">
                  {reservation.carNumber}열차
                </div>
              </div>
            </div>
            
            <div className="text-center pt-3 border-t border-gray-100">
              <div className="text-3xl font-bold mb-2">
                {reservation.seat}
              </div>
              <div className={`text-sm ${reservation.statusColor}`}>
                {reservation.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Indicator */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}