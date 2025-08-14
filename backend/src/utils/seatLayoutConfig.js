/**
 * 좌석 배치 설정
 * 
 * 호선별 좌석 배치 정보:
 * - 각 호선의 표준 좌석 배치
 * - 칸별 좌석 수
 * - 임산부 좌석 위치
 * - 장애인 좌석 위치
 * - 노약자 좌석 위치
 * 
 * 예시 구조:
 * {
 *   "1호선": {
 *     "carsPerTrain": 10,
 *     "seatsPerCar": {
 *       "1": { rows: 2, columns: 20, pregnantSeats: ["A1", "A2"] },
 *       "2": { rows: 2, columns: 20, pregnantSeats: [] },
 *       ...
 *     }
 *   },
 *   "2호선": { ... },
 *   ...
 * }
 * 
 * 유틸리티 함수:
 * - getLayoutByLine(): 호선별 배치 정보
 * - getPregnantSeatPositions(): 임산부 좌석 위치
 * - generateSeatMap(): 좌석 맵 생성
 */

const seatLayoutConfig = {
  // 설정 구현
};

module.exports = seatLayoutConfig;