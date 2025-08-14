/**
 * 예약 데이터 모델
 * 
 * 필드:
 * - id: 예약 ID (자동 생성)
 * - userId: 사용자 ID (Firebase UID)
 * - trainNumber: 열차 번호
 * - carNumber: 칸 번호
 * - seatNumber: 좌석 번호
 * - lineNumber: 호선
 * - departureStation: 출발역
 * - arrivalStation: 도착역
 * - reservationDate: 예약 날짜
 * - boardingTime: 탑승 예정 시간
 * - status: 예약 상태 (pending, confirmed, cancelled, completed)
 * - createdAt: 생성 시간
 * - updatedAt: 수정 시간
 * 
 * 메서드:
 * - create(): 예약 생성
 * - findById(): ID로 예약 조회
 * - findByUserId(): 사용자별 예약 조회
 * - updateStatus(): 예약 상태 변경
 * - delete(): 예약 삭제
 * - checkAvailability(): 좌석 가용성 확인
 */

class Reservation {
  // 모델 구현
}

module.exports = Reservation;