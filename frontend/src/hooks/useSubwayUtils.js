// frontend/src/hooks/useSubwayUtils.js
import { useCallback, useMemo } from 'react';
import { useSubwayContext } from '../contexts/SubwayContext';

/**
 * 지하철 도착 정보 관련 유틸리티 Hook
 */
export function useSubwayArrival() {
  const {
    selectedStation,
    selectedLine,
    arrivalData,
    loading,
    errors,
    lastUpdated,
    cached,
    fetchArrivalData,
    refreshArrivalData
  } = useSubwayContext();

  // 현재 선택된 역의 도착 정보
  const currentArrivalData = useMemo(() => {
    if (!selectedStation || !arrivalData) return [];
    
    // 모든 방향의 열차를 하나의 배열로 평탄화
    const allTrains = [];
    Object.keys(arrivalData).forEach(direction => {
      arrivalData[direction].forEach(train => {
        allTrains.push({
          ...train,
          directionKey: direction
        });
      });
    });
    
    // 도착 시간 순으로 정렬
    return allTrains.sort((a, b) => {
      if (a.remainingTime === null) return 1;
      if (b.remainingTime === null) return -1;
      return a.remainingTime - b.remainingTime;
    });
  }, [selectedStation, arrivalData]);

  // 방향별로 그룹화된 데이터
  const groupedArrivalData = useMemo(() => arrivalData, [arrivalData]);

  // 곧 도착하는 열차들 (2분 이내)
  const upcomingTrains = useMemo(() => {
    return currentArrivalData.filter(train => 
      train.remainingTime !== null && train.remainingTime <= 120
    );
  }, [currentArrivalData]);

  // 특정 호선의 열차만 필터링
  const getTrainsByLine = useCallback((lineName) => {
    return currentArrivalData.filter(train => train.lineName === lineName);
  }, [currentArrivalData]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    if (selectedStation) {
      refreshArrivalData();
    }
  }, [selectedStation, refreshArrivalData]);

  return {
    // 데이터
    arrivalData: currentArrivalData,
    groupedData: groupedArrivalData,
    upcomingTrains,
    
    // 상태
    isLoading: loading.arrival,
    error: errors.arrival,
    lastUpdated,
    cached,
    
    // 함수들
    refresh,
    getTrainsByLine,
    
    // 메타 정보
    hasData: currentArrivalData.length > 0,
    trainCount: currentArrivalData.length
  };
}

/**
 * 지하철 좌석 정보 관련 유틸리티 Hook
 */
export function useSubwaySeat() {
  const {
    selectedTrain,
    seatData,
    loading,
    errors,
    fetchSeatData,
    refreshSeatData
  } = useSubwayContext();

  // 좌석 배치도 데이터 생성
  const seatMap = useMemo(() => {
    if (!seatData) return null;

    const { totalSeats, occupiedSeats = [], reservedSeats = [] } = seatData;
    const seats = [];

    for (let i = 1; i <= totalSeats; i++) {
      let status = 'available';
      if (occupiedSeats.includes(i)) {
        status = 'occupied';
      } else if (reservedSeats.includes(i)) {
        status = 'reserved';
      }

      seats.push({
        number: i,
        status,
        isSelectable: status === 'available'
      });
    }

    return seats;
  }, [seatData]);

  // 좌석을 행별로 그룹화 (8개씩)
  const seatRows = useMemo(() => {
    if (!seatMap) return [];
    
    const rows = [];
    const seatsPerRow = 8;
    
    for (let i = 0; i < seatMap.length; i += seatsPerRow) {
      rows.push(seatMap.slice(i, i + seatsPerRow));
    }
    
    return rows;
  }, [seatMap]);

  // 점유율 정보
  const occupancyInfo = useMemo(() => {
    return seatData?.occupancy || null;
  }, [seatData]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    if (selectedTrain?.trainNumber) {
      refreshSeatData();
    }
  }, [selectedTrain, refreshSeatData]);

  return {
    // 데이터
    seatData,
    seatMap,
    seatRows,
    occupancyInfo,
    selectedTrain,
    
    // 상태
    isLoading: loading.seats,
    error: errors.seats,
    
    // 함수들
    refresh,
    
    // 메타 정보
    hasData: !!seatData,
    totalSeats: seatData?.totalSeats || 0,
    availableSeats: seatData?.availableSeats || 0
  };
}

/**
 * 지하철 노선/역 선택 관련 유틸리티 Hook
 */
export function useSubwaySelection() {
  const {
    selectedLine,
    selectedStation,
    selectedTrain,
    lines,
    stations,
    loading,
    errors,
    setSelectedLine,
    setSelectedStation,
    setSelectedTrain,
    selectStation,
    resetSelection
  } = useSubwayContext();

  // 현재 선택된 호선 정보
  const currentLine = useMemo(() => {
    return lines.find(line => line.name === selectedLine) || null;
  }, [lines, selectedLine]);

  // 역 선택 함수 (호선도 함께 변경)
  const selectStationWithLine = useCallback((stationName, lineName) => {
    selectStation(stationName, lineName);
  }, [selectStation]);

  // 열차 선택 및 해제
  const toggleTrainSelection = useCallback((train) => {
    if (selectedTrain?.trainNumber === train.trainNumber) {
      setSelectedTrain(null); // 같은 열차 선택 시 해제
    } else {
      setSelectedTrain(train);
    }
  }, [selectedTrain, setSelectedTrain]);

  // 선택 상태 확인 함수들
  const isLineSelected = useCallback((lineName) => {
    return selectedLine === lineName;
  }, [selectedLine]);

  const isStationSelected = useCallback((stationName) => {
    return selectedStation === stationName;
  }, [selectedStation]);

  const isTrainSelected = useCallback((trainNumber) => {
    return selectedTrain?.trainNumber === trainNumber;
  }, [selectedTrain]);

  return {
    // 선택된 데이터
    selectedLine,
    selectedStation,
    selectedTrain,
    currentLine,
    
    // 옵션 데이터
    lines,
    stations,
    
    // 로딩 상태
    isLoadingLines: loading.lines,
    isLoadingStations: loading.stations,
    
    // 에러
    linesError: errors.lines,
    stationsError: errors.stations,
    
    // 선택 함수들
    setSelectedLine,
    setSelectedStation,
    setSelectedTrain,
    selectStationWithLine,
    toggleTrainSelection,
    resetSelection,
    
    // 확인 함수들
    isLineSelected,
    isStationSelected,
    isTrainSelected,
    
    // 메타 정보
    hasLineSelected: !!selectedLine,
    hasStationSelected: !!selectedStation,
    hasTrainSelected: !!selectedTrain,
    lineCount: lines.length,
    stationCount: stations.length
  };
}

/**
 * 즐겨찾기 관련 유틸리티 Hook
 */
export function useSubwayFavorites() {
  const {
    favorites,
    selectedStation,
    selectedLine,
    addFavorite,
    removeFavorite,
    isFavorite
  } = useSubwayContext();

  // 현재 선택된 역이 즐겨찾기인지 확인
  const isCurrentStationFavorite = useMemo(() => {
    return selectedStation && selectedLine ? 
      isFavorite(selectedStation, selectedLine) : false;
  }, [selectedStation, selectedLine, isFavorite]);

  // 현재 역 즐겨찾기 토글
  const toggleCurrentFavorite = useCallback(() => {
    if (!selectedStation || !selectedLine) return false;

    if (isCurrentStationFavorite) {
      return removeFavorite(selectedStation, selectedLine);
    } else {
      return addFavorite(selectedStation, selectedLine);
    }
  }, [selectedStation, selectedLine, isCurrentStationFavorite, addFavorite, removeFavorite]);

  // 즐겨찾기를 최근 추가순으로 정렬
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => 
      new Date(b.addedAt) - new Date(a.addedAt)
    );
  }, [favorites]);

  // 호선별로 그룹화
  const favoritesByLine = useMemo(() => {
    return favorites.reduce((acc, fav) => {
      if (!acc[fav.lineName]) {
        acc[fav.lineName] = [];
      }
      acc[fav.lineName].push(fav);
      return acc;
    }, {});
  }, [favorites]);

  return {
    // 데이터
    favorites,
    sortedFavorites,
    favoritesByLine,
    
    // 현재 역 관련
    isCurrentStationFavorite,
    toggleCurrentFavorite,
    
    // 관리 함수들
    addFavorite,
    removeFavorite,
    isFavorite,
    
    // 메타 정보
    favoriteCount: favorites.length,
    hasFavorites: favorites.length > 0
  };
}

/**
 * 지하철 앱 전체 상태 관리 Hook
 */
export function useSubwayApp() {
  const context = useSubwayContext();
  const arrival = useSubwayArrival();
  const seat = useSubwaySeat();
  const selection = useSubwaySelection();
  const favorites = useSubwayFavorites();

  // 앱의 전체적인 상태
  const appState = useMemo(() => {
    const hasValidSelection = selection.hasStationSelected;
    const hasArrivalData = arrival.hasData;
    const hasSeatData = seat.hasData;
    
    return {
      isReady: context.isInitialized && !context.isLoading,
      hasValidSelection,
      hasArrivalData,
      hasSeatData,
      canShowArrival: hasValidSelection,
      canShowSeats: selection.hasTrainSelected,
      isFullyLoaded: hasValidSelection && hasArrivalData
    };
  }, [context, arrival, seat, selection]);

  // 전체 새로고침
  const refreshAll = useCallback(() => {
    arrival.refresh();
    if (selection.hasTrainSelected) {
      seat.refresh();
    }
  }, [arrival, seat, selection.hasTrainSelected]);

  return {
    // 각 기능별 Hook들
    context,
    arrival,
    seat,
    selection,
    favorites,
    
    // 앱 상태
    appState,
    
    // 통합 함수들
    refreshAll,
    
    // 편의 속성들
    isLoading: context.isLoading,
    hasErrors: context.hasErrors,
    autoRefresh: context.autoRefresh,
    lastUpdated: context.lastUpdated
  };
}