// API 호출 함수들
// frontend/src/services/subwayService.js
import { apiRequest } from './apiClient';

/**
 * 지하철 관련 API 서비스 함수들
 */
export const subwayService = {
  
  /**
   * 실시간 지하철 도착 정보 조회
   * @param {string} stationName - 역명 (예: "시청")
   * @param {string} lineNumber - 호선 (선택사항, 예: "2호선")
   * @returns {Promise<Object>} 실시간 도착 정보
   */
  async getRealtimeArrival(stationName, lineNumber = null) {
    try {
      if (!stationName) {
        throw new Error('역명을 입력해주세요.');
      }

      // URL 인코딩 처리
      const encodedStationName = encodeURIComponent(stationName);
      let url = `/subway/arrival/${encodedStationName}`;
      
      // 호선 필터링 쿼리 파라미터 추가
      if (lineNumber) {
        url += `?lineNumber=${encodeURIComponent(lineNumber)}`;
      }

      const response = await apiRequest.get(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '도착 정보를 가져올 수 없습니다.');
      }

      return {
        success: true,
        data: response.data.data,
        cached: response.data.cached || false,
        timestamp: response.data.timestamp,
        count: response.data.count || 0
      };

    } catch (error) {
      console.error('[지하철 도착정보 조회 오류]', error);
      throw error;
    }
  },

  /**
   * 지하철 노선 목록 조회
   * @returns {Promise<Array>} 노선 목록
   */
  async getSubwayLines() {
    try {
      const response = await apiRequest.get('/subway/lines');
      
      if (!response.data.success) {
        throw new Error(response.data.message || '노선 정보를 가져올 수 없습니다.');
      }

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('[지하철 노선 조회 오류]', error);
      throw error;
    }
  },

  /**
   * 특정 호선의 역 목록 조회
   * @param {string} lineNumber - 호선 (예: "2호선")
   * @returns {Promise<Array>} 역 목록
   */
  async getStationsByLine(lineNumber) {
    try {
      if (!lineNumber) {
        throw new Error('호선을 선택해주세요.');
      }

      const encodedLineNumber = encodeURIComponent(lineNumber);
      const response = await apiRequest.get(`/subway/stations/${encodedLineNumber}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '역 목록을 가져올 수 없습니다.');
      }

      return {
        success: true,
        data: response.data.data,
        lineNumber: response.data.lineNumber
      };

    } catch (error) {
      console.error('[지하철 역 목록 조회 오류]', error);
      throw error;
    }
  },

  /**
   * 열차별 좌석 정보 조회
   * @param {string} trainNumber - 열차번호 (예: "2001")
   * @returns {Promise<Object>} 좌석 정보
   */
  async getTrainSeatInfo(trainNumber) {
    try {
      if (!trainNumber) {
        throw new Error('열차번호를 입력해주세요.');
      }

      const response = await apiRequest.get(`/subway/train/${trainNumber}/seats`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '좌석 정보를 가져올 수 없습니다.');
      }

      return {
        success: true,
        data: response.data.data,
        trainNumber: response.data.trainNumber
      };

    } catch (error) {
      console.error('[열차 좌석정보 조회 오류]', error);
      throw error;
    }
  },

  /**
   * API 헬스체크
   * @returns {Promise<Object>} 헬스체크 결과
   */
  async healthCheck() {
    try {
      const response = await apiRequest.get('/subway/health');
      return response.data;
    } catch (error) {
      console.error('[지하철 API 헬스체크 오류]', error);
      throw error;
    }
  }
};

/**
 * 유틸리티 함수들
 */
export const subwayUtils = {
  
  /**
   * 도착 정보를 사용자 친화적으로 포맷팅
   * @param {Object} train - 열차 정보
   * @returns {Object} 포맷된 정보
   */
  formatArrivalInfo(train) {
    if (!train) return null;

    return {
      ...train,
      displayTime: this.formatRemainingTime(train.remainingTime),
      statusColor: this.getStatusColor(train.status),
      isArriving: train.status === '곧 도착' || train.remainingTime <= 60
    };
  },

  /**
   * 남은 시간을 읽기 쉽게 포맷팅
   * @param {number} seconds - 남은 시간(초)
   * @returns {string} 포맷된 시간
   */
  formatRemainingTime(seconds) {
    if (!seconds || seconds <= 0) return '곧 도착';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}초 후`;
    } else if (remainingSeconds === 0) {
      return `${minutes}분 후`;
    } else {
      return `${minutes}분 ${remainingSeconds}초 후`;
    }
  },

  /**
   * 상태에 따른 색상 반환
   * @param {string} status - 열차 상태
   * @returns {string} CSS 클래스명 또는 색상 코드
   */
  getStatusColor(status) {
    switch (status) {
      case '곧 도착':
      case '도착':
        return '#ef4444'; // red-500
      case '출발':
        return '#f97316'; // orange-500
      case '운행중':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  },

  /**
   * 호선명에서 숫자만 추출
   * @param {string} lineName - 호선명 (예: "2호선")
   * @returns {string} 숫자 (예: "2")
   */
  extractLineNumber(lineName) {
    const match = lineName.match(/(\d+)/);
    return match ? match[1] : lineName;
  },

  /**
   * 좌석 점유율 계산
   * @param {Object} seatInfo - 좌석 정보
   * @returns {Object} 점유율 정보
   */
  calculateOccupancyRate(seatInfo) {
    if (!seatInfo) return { rate: 0, level: 'empty' };

    const { totalSeats, occupiedSeats, reservedSeats } = seatInfo;
    const occupiedCount = occupiedSeats?.length || 0;
    const reservedCount = reservedSeats?.length || 0;
    const usedSeats = occupiedCount + reservedCount;
    const rate = Math.round((usedSeats / totalSeats) * 100);

    let level = 'empty';
    if (rate >= 80) level = 'crowded';
    else if (rate >= 50) level = 'moderate';
    else if (rate >= 20) level = 'comfortable';

    return {
      rate,
      level,
      availableSeats: totalSeats - usedSeats,
      occupiedCount,
      reservedCount
    };
  },

  /**
   * 로컬스토리지에 즐겨찾는 역 저장/불러오기
   */
  favoriteStations: {
    get() {
      try {
        const favorites = localStorage.getItem('favoriteStations');
        return favorites ? JSON.parse(favorites) : [];
      } catch (error) {
        console.error('즐겨찾는 역 불러오기 오류:', error);
        return [];
      }
    },

    add(stationName, lineName) {
      try {
        const favorites = this.get();
        const newFavorite = { stationName, lineName, addedAt: new Date().toISOString() };
        
        // 중복 체크
        const exists = favorites.some(fav => 
          fav.stationName === stationName && fav.lineName === lineName
        );
        
        if (!exists) {
          favorites.push(newFavorite);
          localStorage.setItem('favoriteStations', JSON.stringify(favorites));
          return true;
        }
        return false;
      } catch (error) {
        console.error('즐겨찾는 역 추가 오류:', error);
        return false;
      }
    },

    remove(stationName, lineName) {
      try {
        const favorites = this.get();
        const filtered = favorites.filter(fav => 
          !(fav.stationName === stationName && fav.lineName === lineName)
        );
        localStorage.setItem('favoriteStations', JSON.stringify(filtered));
        return true;
      } catch (error) {
        console.error('즐겨찾는 역 삭제 오류:', error);
        return false;
      }
    }
  }
};

// 기본 export
export default subwayService;