import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { subwayService } from '../services/subwayService';

const SeatSearch = () => {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedTrain, setSelectedTrain] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // 드롭다운 상태
  const [showLineDropdown, setShowLineDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showTrainDropdown, setShowTrainDropdown] = useState(false);
  
  // 데이터 상태
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState({});
  const [seatInfo, setSeatInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 노선 목록 가져오기
  useEffect(() => {
    fetchLines();
  }, []);

  // 노선 선택 시 역 목록 가져오기
  useEffect(() => {
    if (selectedLine) {
      fetchStations(selectedLine);
    }
  }, [selectedLine]);

  // 역 선택 시 열차 목록 가져오기
  useEffect(() => {
    if (selectedStation && selectedLine) {
      fetchTrains(selectedStation, selectedLine);
    }
  }, [selectedStation, selectedLine]);

  // 열차 선택 시 좌석 정보 가져오기
  useEffect(() => {
    if (selectedTrain) {
      fetchSeatInfo(selectedTrain);
    }
  }, [selectedTrain]);

  const fetchLines = async () => {
    try {
      setLoading(true);
      const response = await subwayService.getSubwayLines();
      if (response.success) {
        setLines(response.data || []);
      }
    } catch (err) {
      setError('노선 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async (line) => {
    try {
      setLoading(true);
      const response = await subwayService.getStationsByLine(line);
      if (response.success) {
        setStations(response.data || []);
      }
    } catch (err) {
      setError('역 정보를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrains = async (station, line) => {
    try {
      setLoading(true);
      const response = await subwayService.getRealtimeArrival(station, line);
      if (response.success) {
        setTrains(response.data || {});
      }
    } catch (err) {
      setError('열차 정보를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatInfo = async (trainNumber) => {
    try {
      setLoading(true);
      const response = await subwayService.getTrainSeatInfo(trainNumber);
      if (response.success) {
        setSeatInfo(response.data);
      }
    } catch (err) {
      setError('좌석 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLine = (line) => {
    setSelectedLine(line.name || line);
    setSelectedStation('');
    setSelectedTrain('');
    setShowLineDropdown(false);
    setStations([]);
    setTrains({});
    setSeatInfo(null);
  };

  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setSelectedTrain('');
    setShowStationDropdown(false);
    setTrains({});
    setSeatInfo(null);
  };

  const handleSelectTrain = (train) => {
    setSelectedTrain(train.trainNumber || train);
    setShowTrainDropdown(false);
  };

  const handleReservation = () => {
    console.log('예약하기 클릭');
    // 실제로는 navigate('/seat-reservation/confirm')
  };

  const getSeatColor = (type) => {
    switch (type) {
      case 'pregnant':
        return '#E6B3D5';
      case 'selected':
        return '#FF69B4';
      case 'booked':
        return '#FFB6C1';
      case 'general':
      default:
        return '#9B9B9B';
    }
  };

  // 좌석 배치 데이터 (기본값)
  const defaultSeatLayout = {
    rows: 2,
    columns: 6,
    seats: [
      { id: 'A1', row: 0, col: 0, type: 'pregnant' },
      { id: 'A2', row: 0, col: 1, type: 'general' },
      { id: 'A3', row: 0, col: 2, type: 'general' },
      { id: 'A4', row: 0, col: 3, type: 'general' },
      { id: 'A5', row: 0, col: 4, type: 'general' },
      { id: 'A6', row: 0, col: 5, type: 'selected' },
      { id: 'B1', row: 1, col: 0, type: 'booked' },
      { id: 'B2', row: 1, col: 1, type: 'general' },
      { id: 'B3', row: 1, col: 2, type: 'general' },
      { id: 'B4', row: 1, col: 3, type: 'general' },
      { id: 'B5', row: 1, col: 4, type: 'general' },
      { id: 'B6', row: 1, col: 5, type: 'pregnant' }
    ]
  };

  const seatLayout = seatInfo?.seatLayout || defaultSeatLayout;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      {/* 헤더 */}
      <div className="text-center py-4 px-6">
        <h1 className="text-xl font-bold" style={{ color: '#C599B6' }}>
          맘편한 자리
        </h1>
      </div>

      {/* 섹션 헤더 */}
      <div className="px-6 py-4" style={{ backgroundColor: '#F5C9C6' }}>
        <h2 className="text-lg font-bold">실시간 좌석 조회</h2>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-6 py-2">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* 선택 옵션들 */}
      <div className="px-6 py-4 space-y-3">
        {/* 노선 선택 */}
        <div className="relative">
          <button
            onClick={() => setShowLineDropdown(!showLineDropdown)}
            className="w-full p-4 bg-white rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
            style={{ border: '1px solid #E0E0E0' }}
          >
            <span className="text-lg">
              {selectedLine || '노선 선택'}
            </span>
            {showLineDropdown ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {showLineDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {lines.map((line, index) => (
                <button
                  key={line.id || index}
                  onClick={() => handleSelectLine(line)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b last:border-b-0"
                >
                  <span style={{ color: line.color || '#333' }}>
                    {line.name || line}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 역 선택 */}
        <div className="relative">
          <button
            onClick={() => selectedLine && setShowStationDropdown(!showStationDropdown)}
            disabled={!selectedLine}
            className={`w-full p-4 bg-white rounded-2xl flex justify-between items-center transition-shadow ${
              selectedLine ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ border: '1px solid #FFB6C1' }}
          >
            <span className="text-lg">
              {selectedStation || '역 선택'}
            </span>
            {showStationDropdown ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {showStationDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {stations.map((station, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectStation(station)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b last:border-b-0"
                >
                  {station}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 열차 선택 */}
        <div className="relative">
          <button
            onClick={() => selectedStation && setShowTrainDropdown(!showTrainDropdown)}
            disabled={!selectedStation}
            className={`w-full p-4 bg-white rounded-2xl flex justify-between items-center transition-shadow ${
              selectedStation ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ border: '1px solid #E0E0E0' }}
          >
            <span className="text-lg">
              {selectedTrain ? `${selectedTrain}열차` : '열차번호 선택'}
            </span>
            {showTrainDropdown ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          
          {showTrainDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {Object.keys(trains).map((groupKey) => {
                const groupTrains = trains[groupKey];
                const [lineName, direction] = groupKey.split('_');
                
                return (
                  <div key={groupKey} className="border-b last:border-b-0">
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">
                      {direction}
                    </div>
                    {groupTrains.slice(0, 3).map((train, index) => (
                      <button
                        key={`${groupKey}-${index}`}
                        onClick={() => handleSelectTrain(train)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {train.trainNumber || '열차번호 없음'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {train.destination}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {train.arrivalMessage}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 열차 정보 */}
      {selectedTrain && (
        <div className="px-6 py-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold">{selectedLine}</span>
              <span className="text-xl">{selectedTrain}열차</span>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              {new Date().toLocaleDateString('ko-KR')} | {new Date().toLocaleTimeString('ko-KR')} | {selectedStation}
            </div>

            {/* 좌석 통계 */}
            {seatInfo && (
              <div className="flex space-x-3 mb-4">
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
                  총 좌석 {seatInfo.totalSeats || 12}
                </span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
                  사용 중 {seatInfo.occupiedSeats?.length || 1}
                </span>
                <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E6B3D5' }}>
                  사용가능 {seatInfo.availableSeats || 10}
                </span>
              </div>
            )}

            {/* 좌석 배치도 */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">좌석 배치도</h4>
              <div className="grid grid-cols-6 gap-2">
                {seatLayout.seats.map((seat) => (
                  <div
                    key={seat.id}
                    className="h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getSeatColor(seat.type) }}
                  >
                    {seat.id}
                  </div>
                ))}
              </div>
            </div>

            {/* 범례 */}
            <div className="flex justify-center mt-4 space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#9B9B9B' }} />
                <span>예약 가능</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FFB6C1' }} />
                <span>사용중인 좌석</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#FF69B4' }} />
                <span>예약된 좌석</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예약하기 버튼 */}
      {selectedTrain && (
        <div className="px-6 py-4">
          <button
            onClick={handleReservation}
            className="w-full py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
            style={{ backgroundColor: '#F5C9C6' }}
          >
            예약하기
          </button>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSearch;