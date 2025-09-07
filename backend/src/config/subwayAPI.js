// backend/config/subwayAPI.js - 완전히 수정된 버전
const axios = require('axios');

// 서울시 지하철 실시간 도착정보 API 설정
const SUBWAY_API_CONFIG = {
  BASE_URL: 'http://swopenapi.seoul.go.kr/api/subway'
};

// API 호출 헬퍼 함수
const createSubwayAPIClient = () => {
  const client = axios.create({
    baseURL: SUBWAY_API_CONFIG.BASE_URL,
    timeout: 10000, // 타임아웃을 10초로 줄여서 클라이언트보다 먼저 실패하도록 설정
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SubwayApp/1.0'
    }
  });

  client.interceptors.request.use((config) => {
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      
      if (error.response?.status === 429) {
        throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      if (error.response?.status >= 500) {
        throw new Error('서울시 지하철 API 서버에 문제가 발생했습니다.');
      }
      if (error.response?.status === 404) {
        throw new Error('해당 역을 찾을 수 없습니다. 역명을 확인해주세요.');
      }
      throw error;
    }
  );

  return client;
};

// 🔥 수정된 서울시 API 응답 데이터 정제 함수
const parseSubwayResponse = (apiResponse) => {
  try {
    console.log('[Subway API] 원본 응답 구조:', Object.keys(apiResponse.data));
    
    const data = apiResponse.data;
    
    // errorMessage 필드 체크 (실제 응답에서는 errorMessage.code)
    if (data.errorMessage && data.errorMessage.code !== 'INFO-000') {
      console.error('[Subway API] API 오류:', data.errorMessage);
      throw new Error(`API 오류: ${data.errorMessage.message}`);
    }

    // realtimeArrivalList에서 데이터 추출
    const arrivalData = data.realtimeArrivalList || [];
    console.log('[Subway API] 도착 정보 개수:', arrivalData.length);
    
    if (arrivalData.length === 0) {
      console.log('[Subway API] 도착 정보가 없습니다.');
      return [];
    }

    // 첫 번째 데이터 샘플 로깅
    if (arrivalData[0]) {
      console.log('[Subway API] 첫 번째 데이터 샘플 필드:', Object.keys(arrivalData[0]));
      console.log('[Subway API] 샘플 데이터:', {
        statnNm: arrivalData[0].statnNm,
        subwayId: arrivalData[0].subwayId,
        trainLineNm: arrivalData[0].trainLineNm,
        arvlMsg2: arrivalData[0].arvlMsg2,
        btrainNo: arrivalData[0].btrainNo,
        arvlCd: arrivalData[0].arvlCd
      });
    }
    
    return arrivalData.map(train => ({
      stationName: train.statnNm,           // 지하철역명
      lineNumber: train.subwayId,           // 지하철호선ID (1001, 1002, ...)
      lineName: getLineNameFromId(train.subwayId), // 호선명 변환
      direction: train.trainLineNm,         // 도선지방면명 ("성수행 - 충정로방면")
      destination: train.bstatnNm,          // 종착지하철역명
      arrivalMessage: train.arvlMsg2,       // 도착메시지 ("4분 50초 후", "전역 도착")
      arrivalCode: train.arvlCd,            // 도착코드
      trainNumber: train.btrainNo,          // 열차번호
      updatedAt: train.recptnDt,           // 업데이트시간
      status: getTrainStatus(train.arvlCd), // 상태 변환
      remainingTime: extractTimeFromMessage(train.arvlMsg2), // 남은 시간 추출
      
      // 추가 정보
      currentStation: train.statnNm,        
      nextStation: train.arvlMsg3 || '',    // 다음역 정보
      isExpressTrain: train.btrainSttus === '급행',
      updownLine: train.updnLine,           // 상행/하행/내선/외선
      
      // 원본 데이터 보존 (디버깅용)
      _raw: train
    }));
  } catch (error) {
    console.error('[Subway API] 데이터 파싱 오류:', error);
    console.error('[Subway API] 원본 응답:', JSON.stringify(apiResponse.data, null, 2));
    throw new Error('지하철 데이터를 처리하는 중 오류가 발생했습니다.');
  }
};

// 호선 ID를 호선명으로 변환
const getLineNameFromId = (subwayId) => {
  const lineMap = {
    '1001': '1호선', '1002': '2호선', '1003': '3호선', '1004': '4호선',
    '1005': '5호선', '1006': '6호선', '1007': '7호선', '1008': '8호선',
    '1009': '9호선', '1061': '중앙선', '1063': '경의중앙선', 
    '1065': '공항철도', '1067': '경춘선', '1075': '수인분당선', 
    '1077': '신분당선', '1092': '우이신설선'
  };
  
  const result = lineMap[subwayId] || `${subwayId}호선`;
  console.log(`[Subway API] 호선 변환: ${subwayId} -> ${result}`);
  return result;
};

// 도착 코드를 상태로 변환
const getTrainStatus = (arrivalCode) => {
  const statusMap = {
    '0': '곧 도착',      // 진입
    '1': '도착',        // 도착  
    '2': '출발',        // 출발
    '3': '운행중',      // 전역출발
    '4': '운행중',      // 전역진입
    '5': '곧 도착',     // 전역도착
    '99': '운행중'      // 기타
  };
  
  const result = statusMap[arrivalCode] || '운행중';
  console.log(`[Subway API] 상태 변환: ${arrivalCode} -> ${result}`);
  return result;
};

// 🔥 완전히 새로운 시간 추출 함수 - 실제 API 응답에 맞게
const extractTimeFromMessage = (message) => {
  if (!message) return null;
  
  console.log(`[Subway API] 시간 추출 시도: "${message}"`);
  
  // "4분 50초 후" 형태
  const timeMatch = message.match(/(\d+)분\s*(\d+)초\s*후/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1]);
    const seconds = parseInt(timeMatch[2]);
    const total = minutes * 60 + seconds;
    console.log(`[Subway API] 추출된 시간: ${minutes}분 ${seconds}초 = ${total}초`);
    return total;
  }
  
  // "5분 후" 형태  
  const minuteMatch = message.match(/(\d+)분\s*후/);
  if (minuteMatch) {
    const total = parseInt(minuteMatch[1]) * 60;
    console.log(`[Subway API] 추출된 시간: ${minuteMatch[1]}분 = ${total}초`);
    return total;
  }
  
  // "30초 후" 형태
  const secondMatch = message.match(/(\d+)초\s*후/);
  if (secondMatch) {
    const total = parseInt(secondMatch[1]);
    console.log(`[Subway API] 추출된 시간: ${total}초`);
    return total;
  }
  
  // "전역 도착", "전역 출발" 등 - 곧 도착으로 처리
  if (message.includes('전역 도착') || message.includes('곧 도착')) {
    console.log(`[Subway API] 곧 도착으로 판단: "${message}"`);
    return 30; // 30초로 설정
  }
  
  if (message.includes('전역 출발')) {
    console.log(`[Subway API] 전역 출발: "${message}"`);
    return 60; // 1분으로 설정
  }
  
  // "[10]번째 전역" 같은 형태는 시간 정보 없음
  if (message.includes('번째 전역')) {
    console.log(`[Subway API] 번째 전역 정보: "${message}"`);
    return null;
  }
  
  console.log(`[Subway API] 시간 추출 실패: "${message}"`);
  return null;
};

module.exports = {
  SUBWAY_API_CONFIG,
  createSubwayAPIClient,
  parseSubwayResponse
};