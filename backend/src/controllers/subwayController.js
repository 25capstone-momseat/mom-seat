// backend/controllers/subwayController.js

const { createSubwayAPIClient, parseSubwayResponse } = require('../config/subwayAPI');

class SubwayController {
  constructor() {
    this.apiClient = createSubwayAPIClient();
    this.cache = new Map();
    this.CACHE_TTL = 30000; // 30초 캐시
  }

  async getRealtimeArrival(req, res, next) {
    try {
      const { stationName } = req.params;
      const { lineNumber } = req.query;

      if (!stationName) {
        return res.status(400).json({ success: false, message: '역명을 입력해주세요.' });
      }

      const cacheKey = stationName;
      const cachedItem = this.cache.get(cacheKey);

      // 1. 캐시 확인
      if (cachedItem && (Date.now() - cachedItem.timestamp < this.CACHE_TTL)) {
        console.log(`[Controller] Cache HIT for station: ${stationName}`);
        let arrivalData = cachedItem.data;

        // 캐시된 데이터에 필터링 및 그룹화 적용
        if (lineNumber) {
          console.log(`[Controller] 호선 필터링 (캐시): ${lineNumber}`);
          arrivalData = arrivalData.filter(train => train.lineName.startsWith(lineNumber));
        }
        const groupedData = this.groupAndSortTrains(arrivalData);

        return res.json({
          success: true,
          data: groupedData,
          cached: true,
          timestamp: new Date(cachedItem.timestamp).toISOString(),
          count: arrivalData.length,
          stationName,
          lineNumber: lineNumber || null
        });
      }

      // 2. 캐시 없으면 API 호출 (Cache Miss)
      console.log(`[Controller] Cache MISS for station: ${stationName}`);
      const encodedStationName = encodeURIComponent(stationName);
      const endpoint = `/${process.env.SEOUL_SUBWAY_API_KEY}/json/realtimeStationArrival/1/20/${encodedStationName}`;
      
      console.log(`[Controller] API 호출 시작: ${endpoint}`);
      const response = await this.apiClient.get(endpoint);
      console.log(`[Controller] API 호출 완료, 데이터 파싱 시작`);

      // 데이터 파싱
      let arrivalData = parseSubwayResponse(response);
      console.log(`[Controller] 파싱 완료, 총 ${arrivalData.length}개 열차 정보`);

      // 3. 결과를 캐시에 저장 (필터링 전 원본)
      this.cache.set(cacheKey, { data: arrivalData, timestamp: Date.now() });

      // 특정 호선 필터링
      if (lineNumber) {
        console.log(`[Controller] 호선 필터링: ${lineNumber}`);
        arrivalData = arrivalData.filter(train => train.lineName.startsWith(lineNumber));
      }

      // 방향별로 그룹화 및 정렬
      const groupedData = this.groupAndSortTrains(arrivalData);
      console.log(`[Controller] 그룹화 완료, ${Object.keys(groupedData).length}개 방향`);

      return res.json({
        success: true,
        data: groupedData,
        cached: false,
        timestamp: new Date().toISOString(),
        count: arrivalData.length,
        stationName,
        lineNumber: lineNumber || null
      });

    } catch (error) {
      // 에러 핸들링 미들웨어로 전달
      next(error);
    }
  }

  groupAndSortTrains(arrivalData) {
    const grouped = arrivalData.reduce((acc, train) => {
      const key = train.direction || '기타';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(train);
      return acc;
    }, {});

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (a.remainingTime === null) return 1;
        if (b.remainingTime === null) return -1;
        return a.remainingTime - b.remainingTime;
      });
    });

    return grouped;
  }
  
  // 이하 다른 메서드들은 원본과 동일하게 유지됩니다.
  async getSubwayLines(req, res) {
    try {
      const lines = [
        { id: '1001', name: '1호선', color: '#0052A4' },
        { id: '1002', name: '2호선', color: '#00A84D' },
        { id: '1003', name: '3호선', color: '#EF7C1C' },
        { id: '1004', name: '4호선', color: '#00A5DE' },
        { id: '1005', name: '5호선', color: '#996CAC' },
        { id: '1006', name: '6호선', color: '#CD7C2F' },
        { id: '1007', name: '7호선', color: '#747F00' },
        { id: '1008', name: '8호선', color: '#E6186C' },
        { id: '1009', name: '9호선', color: '#BDB092' },
        { id: '1063', name: '경의중앙선', color: '#77C4A3' },
        { id: '1067', name: '경춘선', color: '#178C72' },
        { id: '1075', name: '수인분당선', color: '#FABE00' },
        { id: '1065', name: '공항철도', color: '#0090D2' },
        { id: '1077', name: '신분당선', color: '#D4003B' },
        { id: '1092', name: '우이신설선', color: '#B7C452' },
      ];
      res.json({ success: true, data: lines });
    } catch (error) {
      next(error);
    }
  }

  async getStationsByLine(req, res, next) {
    try {
      const { lineNumber } = req.params;
      const stationMap = {
        '1호선': ['소요산', '동두천', '보산', '동두천중앙', '지행', '덕정', '덕계', '양주', '녹양', '가능', '의정부', '회룡', '망월사', '도봉산', '도봉', '방학', '창동', '녹천', '월계', '광운대', '석계', '신이문', '외대앞', '회기', '청량리', '제기동', '신설동', '동묘앞', '동대문', '종로5가', '종로3가', '종각', '시청', '서울', '남영', '용산', '노량진', '대방', '신길', '영등포', '신도림', '구로', '구일', '개봉', '오류동', '온수', '역곡', '소사', '부천', '중동', '송내', '부개', '부평', '백운', '동암', '간석', '주안', '도화', '제물포', '도원', '동인천', '인천', '광명', '가산디지털단지', '독산', '금천구청', '석수', '관악', '안양', '명학', '금정', '군포', '당정', '의왕', '성균관대', '화서', '수원', '세류', '병점', '세마', '오산대', '오산', '진위', '송탄', '서정리', '지제', '평택', '성환', '직산', '두정', '천안', '봉명', '쌍용(나사렛대)', '아산', '탕정', '배방', '온양온천', '신창', '서동탄'],
        '2호선': ['시청', '을지로입구', '을지로3가', '을지로4가', '동대문역사문화공원', '신당', '상왕십리', '왕십리', '한양대', '뚝섬', '성수', '건대입구', '구의', '강변', '잠실나루', '잠실', '잠실새내', '종합운동장', '삼성', '선릉', '역삼', '강남', '교대', '서초', '방배', '사당', '낙성대', '서울대입구', '봉천', '신림', '신대방', '구로디지털단지', '대림', '신도림', '문래', '영등포구청', '당산', '합정', '홍대입구', '신촌', '이대', '아현', '충정로', '용답', '신답', '용두', '신설동', '도림천', '양천구청', '신정네거리', '까치산'],
        '3호선': ['대화', '주엽', '정발산', '마두', '백석', '대곡', '화정', '원당', '원흥', '삼송', '지축', '구파발', '연신내', '불광', '녹번', '홍제', '무악재', '독립문', '경복궁', '안국', '종로3가', '을지로3가', '충무로', '동대입구', '약수', '금호', '옥수', '압구정', '신사', '잠원', '고속터미널', '교대', '남부터미널', '양재', '매봉', '도곡', '대치', '학여울', '대청', '일원', '수서', '가락시장', '경찰병원', '오금'],
        '4호선': ['진접', '오남', '별내별가람', '당고개', '상계', '노원', '창동', '쌍문', '수유', '미아', '미아사거리', '길음', '성신여대입구', '한성대입구', '혜화', '동대문', '동대문역사문화공원', '충무로', '명동', '회현', '서울', '숙대입구', '삼각지', '신용산', '이촌', '동작', '총신대입구(이수)', '사당', '남태령', '선바위', '경마공원', '대공원', '과천', '정부과천청사', '인덕원', '평촌', '범계', '금정', '산본', '수리산', '대야미', '반월', '상록수', '한대앞', '중앙', '고잔', '초지', '안산', '신길온천', '정왕', '오이도'],
        '5호선': ['방화', '개화산', '김포공항', '송정', '마곡', '발산', '우장산', '화곡', '까치산', '신정', '목동', '오목교', '양평', '영등포구청', '영등포시장', '신길', '여의도', '여의나루', '마포', '공덕', '애오개', '충정로', '서대문', '광화문', '종로3가', '을지로4가', '동대문역사문화공원', '청구', '신금호', '행당', '왕십리', '마장', '답십리', '장한평', '군자', '아차산', '광나루', '천호', '강동', '길동', '굽은다리', '명일', '고덕', '상일동', '강일', '미사', '하남풍산', '하남시청', '하남검단산', '둔촌동', '올림픽공원', '방이', '오금', '개롱', '거여', '마천'],
        '6호선': ['응암', '역촌', '불광', '독바위', '연신내', '구산', '새절', '증산', '디지털미디어시티', '월드컵경기장', '마포구청', '망원', '합정', '상수', '광흥창', '대흥', '공덕', '효창공원앞', '삼각지', '녹사평', '이태원', '한강진', '버티고개', '약수', '청구', '신당', '동묘앞', '창신', '보문', '안암', '고려대', '월곡', '상월곡', '돌곶이', '석계', '태릉입구', '화랑대', '봉화산', '신내'],
        '7호선': ['장암', '도봉산', '수락산', '마들', '노원', '중계', '하계', '공릉', '태릉입구', '먹골', '중화', '상봉', '면목', '사가정', '용마산', '중곡', '군자', '어린이대공원', '건대입구', '뚝섬유원지', '청담', '강남구청', '학동', '논현', '반포', '고속터미널', '내방', '이수', '남성', '숭실대입구', '상도', '장승배기', '신대방삼거리', '보라매', '신풍', '대림', '남구로', '가산디지털단지', '철산', '광명사거리', '천왕', '온수', '까치울', '부천종합운동장', '춘의', '신중동', '부천시청', '상동', '삼산체육관', '굴포천', '부평구청', '산곡', '석남'],
        '8호선': ['별내', '다산', '동구릉', '구리', '장자호수공원', '암사역사공원', '암사', '천호', '강동구청', '몽촌토성', '잠실', '석촌', '송파', '가락시장', '문정', '장지', '복정', '남위례', '산성', '남한산성입구', '단대오거리', '신흥', '수진', '모란'],
        '9호선': ['개화', '김포공항', '공항시장', '신방화', '마곡나루', '양천향교', '가양', '증미', '등촌', '염창', '신목동', '선유도', '당산', '국회의사당', '여의도', '샛강', '노량진', '노들', '흑석', '동작', '구반포', '신반포', '고속터미널', '사평', '신논현', '언주', '선정릉', '삼성중앙', '봉은사', '종합운동장', '삼전', '석촌고분', '석촌', '송파나루', '한성백제', '올림픽공원', '둔촌오륜', '중앙보훈병원'],
        '경의중앙선': ['용문', '원덕', '양평', '오빈', '아신', '국수', '신원', '양수', '운길산', '팔당', '도심', '덕소', '양정', '도농', '구리', '양원', '망우', '상봉', '중랑', '회기', '청량리', '왕십리', '응봉', '한남', '서빙고', '이촌', '용산', '효창공원앞', '공덕', '서강대', '홍대입구', '가좌', '디지털미디어시티', '수색', '화전', '강매', '행신', '능곡', '대곡', '곡산', '백마', '풍산', '일산', '탄현', '야당', '운정', '금릉', '금촌', '월롱', '파주', '문산'],
        '경춘선': ['춘천', '남춘천', '김유정', '강촌', '백양리', '굴봉산', '가평', '상천', '청평', '대성리', '마석', '천마산', '평내호평', '금곡', '사릉', '퇴계원', '별내', '갈매', '신내', '망우', '상봉', '중랑', '회기', '청량리'],
        '수인분당선': ['인천', '신포', '숭의', '인하대', '송도', '연수', '원인재', '남동인더스파크', '호구포', '인천논현', '소래포구', '월곶', '달월', '오이도', '정왕', '신길온천', '안산', '초지', '고잔', '중앙', '한대앞', '사리', '야목', '어천', '오목천', '고색', '수원', '매교', '수원시청', '매탄권선', '망포', '영통', '청명', '상갈', '기흥', '신갈', '구성', '보정', '죽전', '오리', '미금', '정자', '수내', '서현', '이매', '야탑', '모란', '태평', '가천대', '복정', '수서', '대모산입구', '개포동', '구룡', '도곡', '한티', '선릉', '선정릉', '강남구청', '압구정로데오', '서울숲', '왕십리', '청량리'],
        '신분당선': ['광교', '광교중앙', '상현', '성복', '수지구청', '동천', '미금', '정자', '판교', '청계산입구', '양재시민의숲', '양재', '강남', '신논현', '논현', '신사'],
        '우이신설선': ['신설동', '보문', '성신여대입구', '정릉', '북한산보국문', '솔샘', '삼양사거리', '삼양', '화계', '가오리', '4.19민주묘지', '솔밭공원', '북한산우이'],
      };
      const stations = stationMap[lineNumber] || [];
      res.json({ success: true, data: stations });
    } catch (error) {
      next(error);
    }
  }

  async getTrainSeatInfo(req, res, next) {
    try {
      const { trainNumber } = req.params;
      if (!trainNumber) {
        return res.status(400).json({ success: false, message: '열차번호를 입력해주세요.' });
      }
      const seatInfo = this.generateMockSeatData(trainNumber);
      res.json({ success: true, data: seatInfo });
    } catch (error) {
      next(error);
    }
  }

  generateMockSeatData(trainNumber) {
    const seed = trainNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (s) => {
      let t = s % 2147483647;
      t = (t * 16807) % 2147483647;
      return (t - 1) / 2147483646;
    };

    const totalSeats = 48;
    let currentSeed = seed;
    const occupiedCount = Math.floor(random(currentSeed++) * totalSeats * 0.7);
    const reservedCount = Math.floor(random(currentSeed++) * (totalSeats - occupiedCount) * 0.3);

    const occupiedSeats = [];
    const reservedSeats = [];
    const usedSeats = new Set();

    while (occupiedSeats.length < occupiedCount) {
      const seat = Math.floor(random(currentSeed++) * totalSeats) + 1;
      if (!usedSeats.has(seat)) {
        occupiedSeats.push(seat);
        usedSeats.add(seat);
      }
    }

    while (reservedSeats.length < reservedCount) {
      const seat = Math.floor(random(currentSeed++) * totalSeats) + 1;
      if (!usedSeats.has(seat)) {
        reservedSeats.push(seat);
        usedSeats.add(seat);
      }
    }

    return {
      trainNumber,
      totalSeats,
      occupiedSeats: occupiedSeats.sort((a, b) => a - b),
      reservedSeats: reservedSeats.sort((a, b) => a - b),
      availableSeats: totalSeats - occupiedCount - reservedCount,
      lastUpdated: new Date().toISOString()
    };
  }
}

const subwayController = new SubwayController();

module.exports = {
  getRealtimeArrival: subwayController.getRealtimeArrival.bind(subwayController),
  getSubwayLines: subwayController.getSubwayLines.bind(subwayController),
  getStationsByLine: subwayController.getStationsByLine.bind(subwayController),
  getTrainSeatInfo: subwayController.getTrainSeatInfo.bind(subwayController)
};