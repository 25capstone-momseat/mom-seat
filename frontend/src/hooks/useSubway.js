// frontend/src/hooks/useSubway.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { subwayService, subwayUtils } from '../services/subwayService';

/**
 * 지하철 실시간 도착 정보 훅
 * @param {string} stationName - 역명
 * @param {string} lineNumber - 호선 (선택사항)
 * @param {Object} options - 옵션들
 * @returns {Object} 상태와 함수들
 */
export const useSubwayArrival = (stationName, lineNumber = null, options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30초
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cached, setCached] = useState(false);

  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 데이터 가져오기 함수
  const fetchArrivalData = useCallback(async (showLoading = true) => {
    if (!stationName || !enabled) return;

    try {
      // 이전 요청이 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const result = await subwayService.getRealtimeArrival(stationName, lineNumber);
      
      // 데이터 포맷팅
      const formattedData = {};
      Object.keys(result.data).forEach(key => {
        formattedData[key] = result.data[key].map(train => 
          subwayUtils.formatArrivalInfo(train)
        );
      });

      setData(formattedData);
      setCached(result.cached);
      setLastUpdated(new Date());

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('도착 정보 조회 오류:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [stationName, lineNumber, enabled]);

  // 수동 새로고침
  const refresh = useCallback(() => {
    fetchArrivalData(true);
  }, [fetchArrivalData]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    // 즉시 실행
    fetchArrivalData(true);

    // 주기적 업데이트 설정
    intervalRef.current = setInterval(() => {
      fetchArrivalData(false); // 백그라운드 업데이트는 로딩 표시 안함
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchArrivalData, autoRefresh, refreshInterval, enabled]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    cached,
    refresh,
    isRefreshing: loading
  };
};

/**
 * 지하철 노선 정보 훅
 * @returns {Object} 노선 데이터와 상태
 */
export const useSubwayLines = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await subwayService.getSubwayLines();
        setLines(result.data);
        
      } catch (err) {
        console.error('노선 정보 조회 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLines();
  }, []);

  return { lines, loading, error };
};

/**
 * 특정 호선의 역 목록 훅
 * @param {string} lineNumber - 호선
 * @returns {Object} 역 데이터와 상태
 */
export const useStationsByLine = (lineNumber) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lineNumber) {
      setStations([]);
      return;
    }

    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await subwayService.getStationsByLine(lineNumber);
        setStations(result.data);
        
      } catch (err) {
        console.error('역 목록 조회 오류:', err);
        setError(err.message);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [lineNumber]);

  return { stations, loading, error };
};

/**
 * 열차 좌석 정보 훅
 * @param {string} trainNumber - 열차번호
 * @returns {Object} 좌석 데이터와 상태
 */
export const useTrainSeatInfo = (trainNumber) => {
  const [seatInfo, setSeatInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeatInfo = useCallback(async () => {
    if (!trainNumber) {
      setSeatInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await subwayService.getTrainSeatInfo(trainNumber);
      const seatData = result.data;
      
      // 점유율 계산 추가
      const occupancyInfo = subwayUtils.calculateOccupancyRate(seatData);
      
      setSeatInfo({
        ...seatData,
        occupancy: occupancyInfo
      });
      
    } catch (err) {
      console.error('좌석 정보 조회 오류:', err);
      setError(err.message);
      setSeatInfo(null);
    } finally {
      setLoading(false);
    }
  }, [trainNumber]);

  useEffect(() => {
    fetchSeatInfo();
  }, [fetchSeatInfo]);

  const refresh = useCallback(() => {
    fetchSeatInfo();
  }, [fetchSeatInfo]);

  return { 
    seatInfo, 
    loading, 
    error, 
    refresh,
    occupancy: seatInfo?.occupancy 
  };
};

/**
 * 즐겨찾는 역 관리 훅
 * @returns {Object} 즐겨찾는 역 데이터와 관리 함수들
 */
export const useFavoriteStations = () => {
  const [favorites, setFavorites] = useState([]);

  // 초기 데이터 로드
  useEffect(() => {
    const loadFavorites = () => {
      const savedFavorites = subwayUtils.favoriteStations.get();
      setFavorites(savedFavorites);
    };

    loadFavorites();
  }, []);

  // 즐겨찾기 추가
  const addFavorite = useCallback((stationName, lineName) => {
    const success = subwayUtils.favoriteStations.add(stationName, lineName);
    if (success) {
      const updatedFavorites = subwayUtils.favoriteStations.get();
      setFavorites(updatedFavorites);
    }
    return success;
  }, []);

  // 즐겨찾기 제거
  const removeFavorite = useCallback((stationName, lineName) => {
    const success = subwayUtils.favoriteStations.remove(stationName, lineName);
    if (success) {
      const updatedFavorites = subwayUtils.favoriteStations.get();
      setFavorites(updatedFavorites);
    }
    return success;
  }, []);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback((stationName, lineName) => {
    return favorites.some(fav => 
      fav.stationName === stationName && fav.lineName === lineName
    );
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
};

/**
 * 지하철 통합 상태 관리 훅 (Context 대신 사용 가능)
 * @returns {Object} 통합된 지하철 상태와 함수들
 */
export const useSubwayState = () => {
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);

  // 선택된 역/호선의 도착 정보
  const arrivalData = useSubwayArrival(
    selectedStation, 
    selectedLine,
    { enabled: !!selectedStation }
  );

  // 선택된 열차의 좌석 정보
  const seatData = useTrainSeatInfo(selectedTrain?.trainNumber);

  // 노선 정보
  const { lines } = useSubwayLines();

  // 역 목록
  const { stations } = useStationsByLine(selectedLine);

  // 즐겨찾기
  const favoriteData = useFavoriteStations();

  // 상태 초기화 함수들
  const resetSelection = useCallback(() => {
    setSelectedStation('');
    setSelectedLine('');
    setSelectedTrain(null);
  }, []);

  const selectStation = useCallback((stationName, lineName = '') => {
    setSelectedStation(stationName);
    setSelectedLine(lineName);
    setSelectedTrain(null);
  }, []);

  const selectTrain = useCallback((train) => {
    setSelectedTrain(train);
  }, []);

  return {
    // 선택된 상태
    selectedStation,
    selectedLine,
    selectedTrain,
    
    // 데이터
    arrivalData,
    seatData,
    lines,
    stations,
    ...favoriteData,
    
    // 액션 함수들
    setSelectedStation,
    setSelectedLine,
    selectStation,
    selectTrain,
    resetSelection
  };
};