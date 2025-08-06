// frontend/src/contexts/SubwayContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { subwayService, subwayUtils } from '../services/subwayService';

const initialState = {
  selectedLine: '',
  selectedStation: '',
  selectedTrain: null,
  lines: [],
  stations: [],
  arrivalData: {},
  seatData: null,
  favorites: [],
  loading: {
    lines: false,
    stations: false,
    arrival: false,
    seats: false
  },
  errors: {
    lines: null,
    stations: null,
    arrival: null,
    seats: null
  },
  lastUpdated: null,
  cached: false,
  autoRefresh: true,
  refreshInterval: 30000,
  isInitialized: false
};

const ActionTypes = {
  SET_SELECTED_LINE: 'SET_SELECTED_LINE',
  SET_SELECTED_STATION: 'SET_SELECTED_STATION',
  SET_SELECTED_TRAIN: 'SET_SELECTED_TRAIN',
  RESET_SELECTION: 'RESET_SELECTION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LINES: 'SET_LINES',
  SET_STATIONS: 'SET_STATIONS',
  SET_ARRIVAL_DATA: 'SET_ARRIVAL_DATA',
  SET_SEAT_DATA: 'SET_SEAT_DATA',
  SET_FAVORITES: 'SET_FAVORITES',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',
  SET_CACHED: 'SET_CACHED',
  SET_AUTO_REFRESH: 'SET_AUTO_REFRESH',
  SET_REFRESH_INTERVAL: 'SET_REFRESH_INTERVAL',
  SET_INITIALIZED: 'SET_INITIALIZED',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  RESET_STATE: 'RESET_STATE'
};

function subwayReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SELECTED_LINE:
      return {
        ...state,
        selectedLine: action.payload,
        selectedStation: '',
        selectedTrain: null,
        arrivalData: {},
        seatData: null
      };
    case ActionTypes.SET_SELECTED_STATION:
      return {
        ...state,
        selectedStation: action.payload,
        selectedTrain: null,
        seatData: null
      };
    case ActionTypes.SET_SELECTED_TRAIN:
      return {
        ...state,
        selectedTrain: action.payload
      };
    case ActionTypes.RESET_SELECTION:
      return {
        ...state,
        selectedLine: '',
        selectedStation: '',
        selectedTrain: null,
        arrivalData: {},
        seatData: null
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error
        }
      };
    case ActionTypes.SET_LINES:
      return {
        ...state,
        lines: action.payload
      };
    case ActionTypes.SET_STATIONS:
      return {
        ...state,
        stations: action.payload
      };
    case ActionTypes.SET_ARRIVAL_DATA:
      return {
        ...state,
        arrivalData: action.payload
      };
    case ActionTypes.SET_SEAT_DATA:
      return {
        ...state,
        seatData: action.payload
      };
    case ActionTypes.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };
    case ActionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload
      };
    case ActionTypes.SET_CACHED:
      return {
        ...state,
        cached: action.payload
      };
    case ActionTypes.SET_AUTO_REFRESH:
      return {
        ...state,
        autoRefresh: action.payload
      };
    case ActionTypes.SET_REFRESH_INTERVAL:
      return {
        ...state,
        refreshInterval: action.payload
      };
    case ActionTypes.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: action.payload
      };
    case ActionTypes.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    case ActionTypes.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => 
          !(fav.stationName === action.payload.stationName && 
            fav.lineName === action.payload.lineName)
        )
      };
    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        favorites: state.favorites
      };
    default:
      return state;
  }
}

const SubwayContext = createContext();

export function SubwayProvider({ children }) {
  const [state, dispatch] = useReducer(subwayReducer, initialState);
  
  const refreshTimer = React.useRef(null);
  const abortController = React.useRef(null);

  const fetchLines = useCallback(async () => {
    try {
      console.log('[Debug] 노선 정보 요청 시작');
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'lines', value: true } });
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'lines', error: null } });
      
      const result = await subwayService.getSubwayLines();
      console.log('[Debug] 노선 정보 응답:', result);
      
      dispatch({ type: ActionTypes.SET_LINES, payload: result.data });
      
    } catch (error) {
      console.error('[Context] 노선 조회 오류:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'lines', error: error.message } });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'lines', value: false } });
    }
  }, []);

  const fetchStations = useCallback(async (lineNumber) => {
    if (!lineNumber) return;
    
    try {
      console.log('[Debug] 역 목록 요청 시작:', lineNumber);
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'stations', value: true } });
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'stations', error: null } });
      
      const result = await subwayService.getStationsByLine(lineNumber);
      console.log('[Debug] 역 목록 응답:', result);
      
      dispatch({ type: ActionTypes.SET_STATIONS, payload: result.data });
      
    } catch (error) {
      console.error('[Context] 역 목록 조회 오류:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'stations', error: error.message } });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'stations', value: false } });
    }
  }, []);

  const fetchArrivalData = useCallback(async (stationName, lineNumber = null, showLoading = true) => {
    if (!stationName) return;
    
    try {
      console.log('[Debug] 도착 정보 요청 시작:', stationName, lineNumber);
      
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();
      
      if (showLoading) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'arrival', value: true } });
      }
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'arrival', error: null } });
      
      const result = await subwayService.getRealtimeArrival(stationName, lineNumber);
      console.log('[Debug] 도착 정보 원본 응답:', result);
      
      let formattedData = result.data;
      
      // 백엔드에서 그룹화되지 않은 배열로 왔다면 그룹화 처리
      if (Array.isArray(result.data)) {
        console.log('[Debug] 배열 형태 데이터를 그룹화');
        formattedData = result.data.reduce((acc, train) => {
          const formatted = subwayUtils.formatArrivalInfo(train);
          const key = `${formatted.lineName}_${formatted.direction}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(formatted);
          return acc;
        }, {});
      } else {
        // 이미 그룹화된 데이터라면 포맷팅만
        console.log('[Debug] 그룹화된 데이터 포맷팅');
        Object.keys(formattedData).forEach(key => {
          formattedData[key] = formattedData[key].map(train => 
            subwayUtils.formatArrivalInfo(train)
          );
        });
      }
      
      console.log('[Debug] 최종 포맷된 데이터:', formattedData);
      
      dispatch({ type: ActionTypes.SET_ARRIVAL_DATA, payload: formattedData });
      dispatch({ type: ActionTypes.SET_CACHED, payload: result.cached });
      dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: new Date() });
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[Context] 도착정보 조회 오류:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'arrival', error: error.message } });
      }
    } finally {
      if (showLoading) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'arrival', value: false } });
      }
    }
  }, []);

  const fetchSeatData = useCallback(async (trainNumber) => {
    if (!trainNumber) {
      dispatch({ type: ActionTypes.SET_SEAT_DATA, payload: null });
      return;
    }
    
    try {
      console.log('[Debug] 좌석 정보 요청 시작:', trainNumber);
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'seats', value: true } });
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'seats', error: null } });
      
      const result = await subwayService.getTrainSeatInfo(trainNumber);
      console.log('[Debug] 좌석 정보 응답:', result);
      
      const seatData = result.data;
      const occupancyInfo = subwayUtils.calculateOccupancyRate(seatData);
      
      dispatch({ type: ActionTypes.SET_SEAT_DATA, payload: {
        ...seatData,
        occupancy: occupancyInfo
      }});
      
    } catch (error) {
      console.error('[Context] 좌석정보 조회 오류:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { type: 'seats', error: error.message } });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { type: 'seats', value: false } });
    }
  }, []);

  // 초기화 함수를 별도로 정의
  const initialize = useCallback(async () => {
    try {
      console.log('[Debug] Context 초기화 시작');
      
      // 노선 정보 로드
      await fetchLines();
      
      // 즐겨찾기 로드
      const favorites = subwayUtils.favoriteStations.get();
      dispatch({ type: ActionTypes.SET_FAVORITES, payload: favorites });
      
      dispatch({ type: ActionTypes.SET_INITIALIZED, payload: true });
      console.log('[Debug] Context 초기화 완료');
      
    } catch (error) {
      console.error('[Context] 초기화 오류:', error);
    }
  }, [fetchLines]); // fetchLines 의존성만 추가

  // 나머지 액션들
  const setSelectedLine = useCallback((line) => {
    console.log('[Debug] 호선 선택:', line);
    dispatch({ type: ActionTypes.SET_SELECTED_LINE, payload: line });
  }, []);

  const setSelectedStation = useCallback((station) => {
    console.log('[Debug] 역 선택:', station);
    dispatch({ type: ActionTypes.SET_SELECTED_STATION, payload: station });
  }, []);

  const setSelectedTrain = useCallback((train) => {
    console.log('[Debug] 열차 선택:', train);
    dispatch({ type: ActionTypes.SET_SELECTED_TRAIN, payload: train });
  }, []);

  const selectStation = useCallback((stationName, lineName = '') => {
    console.log('[Debug] 역 선택 (호선 포함):', stationName, lineName);
    if (lineName && lineName !== state.selectedLine) {
      dispatch({ type: ActionTypes.SET_SELECTED_LINE, payload: lineName });
    }
    dispatch({ type: ActionTypes.SET_SELECTED_STATION, payload: stationName });
  }, [state.selectedLine]);

  const resetSelection = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_SELECTION });
  }, []);

  // 즐겨찾기 관련
  const addFavorite = useCallback((stationName, lineName) => {
    const success = subwayUtils.favoriteStations.add(stationName, lineName);
    if (success) {
      const newFavorite = { stationName, lineName, addedAt: new Date().toISOString() };
      dispatch({ type: ActionTypes.ADD_FAVORITE, payload: newFavorite });
    }
    return success;
  }, []);

  const removeFavorite = useCallback((stationName, lineName) => {
    const success = subwayUtils.favoriteStations.remove(stationName, lineName);
    if (success) {
      dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: { stationName, lineName } });
    }
    return success;
  }, []);

  const refreshArrivalData = useCallback(() => {
    if (state.selectedStation) {
      fetchArrivalData(state.selectedStation, state.selectedLine, true);
    }
  }, [state.selectedStation, state.selectedLine, fetchArrivalData]);

  const refreshSeatData = useCallback(() => {
    if (state.selectedTrain?.trainNumber) {
      fetchSeatData(state.selectedTrain.trainNumber);
    }
  }, [state.selectedTrain, fetchSeatData]);

  // 기화 useEffect
  useEffect(() => {
    if (!state.isInitialized) {
      console.log('[Debug] useEffect: 초기화 실행');
      initialize();
    }
  }, [state.isInitialized, initialize]);

  // 호선 변경 시 역 목록 로드
  useEffect(() => {
    if (state.selectedLine) {
      console.log('[Debug] useEffect: 역 목록 로드', state.selectedLine);
      fetchStations(state.selectedLine);
    } else {
      // 호선이 없으면 역 목록 초기화
      dispatch({ type: ActionTypes.SET_STATIONS, payload: [] });
    }
  }, [state.selectedLine, fetchStations]);

  // 역 선택 시 도착 정보 로드
  useEffect(() => {
    if (state.selectedStation) {
      console.log('[Debug] useEffect: 도착 정보 로드', state.selectedStation, state.selectedLine);
      fetchArrivalData(state.selectedStation, state.selectedLine);
    } else {
      // 역이 없으면 도착 정보 초기화
      dispatch({ type: ActionTypes.SET_ARRIVAL_DATA, payload: {} });
    }
  }, [state.selectedStation, state.selectedLine, fetchArrivalData]);

  // 열차 선택 시 좌석 정보 로드
  useEffect(() => {
    if (state.selectedTrain?.trainNumber) {
      console.log('[Debug] useEffect: 좌석 정보 로드', state.selectedTrain.trainNumber);
      fetchSeatData(state.selectedTrain.trainNumber);
    } else {
      // 열차가 없으면 좌석 정보 초기화
      dispatch({ type: ActionTypes.SET_SEAT_DATA, payload: null });
    }
  }, [state.selectedTrain?.trainNumber, fetchSeatData]);

  // 자동 새로고침
  useEffect(() => {
    if (state.autoRefresh && state.selectedStation && state.refreshInterval > 0) {
      console.log('[Debug] 자동 새로고침 설정');
      refreshTimer.current = setInterval(() => {
        console.log('[Debug] 자동 새로고침 실행');
        fetchArrivalData(state.selectedStation, state.selectedLine, false);
      }, state.refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [state.autoRefresh, state.selectedStation, state.selectedLine, state.refreshInterval, fetchArrivalData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const isFavorite = useCallback((stationName, lineName) => {
    return state.favorites.some(fav => 
      fav.stationName === stationName && fav.lineName === lineName
    );
  }, [state.favorites]);

  const contextValue = {
    ...state,
    
    // 선택 관련
    setSelectedLine,
    setSelectedStation,
    setSelectedTrain,
    selectStation,
    resetSelection,
    
    // 데이터 페칭
    fetchLines,
    fetchStations,
    fetchArrivalData,
    fetchSeatData,
    
    // 새로고침
    refreshArrivalData,
    refreshSeatData,
    
    // 즐겨찾기
    addFavorite,
    removeFavorite,
    isFavorite,
    
    // 편의 속성
    isLoading: Object.values(state.loading).some(Boolean),
    hasErrors: Object.values(state.errors).some(Boolean)
  };

  return (
    <SubwayContext.Provider value={contextValue}>
      {children}
    </SubwayContext.Provider>
  );
}

export function useSubwayContext() {
  const context = useContext(SubwayContext);
  
  if (!context) {
    throw new Error('useSubwayContext must be used within a SubwayProvider');
  }
  
  return context;
}

export { ActionTypes };
export default SubwayContext;