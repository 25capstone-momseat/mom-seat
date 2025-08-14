/**
 * 좌석 데이터 모델
 * 
 * 필드:
 * - id: 좌석 ID
 * - trainNumber: 열차 번호
 * - carNumber: 칸 번호
 * - seatNumber: 좌석 번호
 * - seatType: 좌석 유형 (pregnant, general, disabled, elderly)
 * - status: 좌석 상태 (available, occupied, reserved, maintenance)
 * - currentReservationId: 현재 예약 ID (있는 경우)
 * - updatedAt: 마지막 업데이트 시간
 * 
 * 메서드:
 * - getSeatsByTrain(): 열차별 좌석 조회
 * - getSeatsByCar(): 칸별 좌석 조회
 * - updateStatus(): 좌석 상태 업데이트
 * - checkAvailability(): 좌석 이용 가능 여부 확인
 * - getLayout(): 좌석 배치 정보 반환
 * - resetExpiredReservations(): 만료된 예약 초기화
 */

class Seat {
  // 모델 구현
}

module.exports = Seat;