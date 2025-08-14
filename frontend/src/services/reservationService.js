/**
 * 예약 관련 API 서비스
 * 
 * API 엔드포인트:
 * - POST /api/reservations/create - 예약 생성
 * - DELETE /api/reservations/:id - 예약 취소
 * - GET /api/reservations/my - 내 예약 목록
 * - GET /api/reservations/:id - 예약 상세 조회
 * - PUT /api/reservations/:id - 예약 수정
 * - GET /api/reservations/seat-status/:trainNumber/:carNumber - 좌석 상태 조회
 * 
 * 데이터 포맷:
 * - 요청/응답 데이터 변환
 * - 에러 처리
 * - 토큰 관리
 * 
 * 캐싱:
 * - 좌석 상태 캐싱 (짧은 TTL)
 * - 예약 목록 캐싱
 */

const reservationService = {
  // 서비스 구현
};

export default reservationService;