/**
 * 프론트엔드 Firestore 컬렉션 설정
 * 
 * 백엔드와 동일한 컬렉션 구조 사용
 * 프론트엔드에서 직접 Firestore 접근 시 사용
 * 
 * 주의사항:
 * - 읽기 전용 작업만 수행
 * - 쓰기 작업은 백엔드 API를 통해 수행
 * - 실시간 리스너는 최소화
 */

export const COLLECTIONS = {
  USERS: 'users',
  TRAINS: 'trains',
  RESERVATIONS: 'reservations',
  SEAT_STATUS: 'seatStatus',
  PREGNANT_CERTIFICATES: 'pregnantCertificates',
  // 서브컬렉션
  SEATS: 'seats'
};

export default COLLECTIONS;