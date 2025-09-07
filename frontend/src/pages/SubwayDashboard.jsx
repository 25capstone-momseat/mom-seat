import React from 'react';
import { ChevronRight, MapPin, Clock, RefreshCw } from 'lucide-react';
import { useSubwayApp } from '../hooks/useSubwayUtils';
import SeatMap from '../components/SeatMap'; // SeatMap 컴포넌트 임포트

const SubwayDashboard = () => {
  const { 
    selection, 
    arrival, 
    seat, 
    favorites,
    appState,
    refreshAll 
  } = useSubwayApp();

  const getStatusColor = (status) => {
    switch(status) {
      case '곧 도착': return 'text-red-500';
      case '운행중': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen" style={{backgroundColor: '#FFF7F3'}}>
      {/* 헤더 */}
      <div className="flex items-center justify-center py-4 border-b">
        <h1 className="text-lg font-medium text-gray-800">맘편한 자리</h1>
      </div>

      {/* 지하철 실시간 도착 정보 섹션 */}
      <div style={{backgroundColor: '#FFF7F3'}} className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">실시간 지하철 도착 정보</h2>
          <button 
            onClick={refreshAll}
            className="p-2 rounded-full transition-colors"
            style={{backgroundColor: 'rgba(197, 153, 182, 0.1)'}}
            disabled={arrival.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${arrival.isLoading ? 'animate-spin' : ''}`} style={{color: '#C599B6'}} />
          </button>
        </div>

        {/* 필터 선택 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">호선</label>
            <select 
              value={selection.selectedLine} 
              onChange={(e) => selection.setSelectedLine(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
              style={{focusRingColor: '#C599B6'}}
              disabled={selection.isLoadingLines}
            >
              <option value="">호선 선택</option>
              {selection.lines.map(line => (
                <option key={line.id} value={line.name}>{line.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역명</label>
            <select 
              value={selection.selectedStation} 
              onChange={(e) => selection.setSelectedStation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2"
              style={{focusRingColor: '#C599B6'}}
              disabled={!selection.selectedLine || selection.isLoadingStations}
            >
              <option value="">역 선택</option>
              {selection.stations.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 즐겨찾기 역 빠른 선택 */}
        {favorites.hasFavorites && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">즐겨찾는 역</p>
            <div className="flex flex-wrap gap-2">
              {favorites.favorites.slice(0, 3).map((fav, index) => (
                <button
                  key={index}
                  onClick={() => selection.selectStationWithLine(fav.stationName, fav.lineName)}
                  className="px-3 py-1 text-xs rounded-full border transition-colors"
                  style={{
                    borderColor: '#C599B6',
                    backgroundColor: selection.selectedStation === fav.stationName ? '#C599B6' : 'white',
                    color: selection.selectedStation === fav.stationName ? 'white' : '#C599B6'
                  }}
                >
                  {fav.lineName} {fav.stationName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {(selection.linesError || selection.stationsError || arrival.error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {selection.linesError || selection.stationsError || arrival.error}
            </p>
          </div>
        )}

        {/* 실시간 도착 정보 */}
        <div className="space-y-2">
          {arrival.isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{borderColor: '#C599B6'}}></div>
              <p className="text-sm text-gray-500 mt-2">데이터를 불러오는 중...</p>
            </div>
          ) : arrival.hasData ? (
            arrival.arrivalData.map((train, index) => (
              <button 
                key={index} 
                onClick={() => selection.toggleTrainSelection(train)}
                className="w-full bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all text-left"
                style={{
                  borderColor: selection.isTrainSelected(train.trainNumber) ? '#C599B6' : undefined,
                  backgroundColor: selection.isTrainSelected(train.trainNumber) ? 'rgba(197, 153, 182, 0.05)' : 'white'
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" style={{color: '#C599B6'}} />
                    <span className="font-medium text-gray-800">{train.direction}</span>
                    {train.isArriving && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        곧 도착
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(train.status)}`}>
                    {train.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{train.displayTime}</span>
                  <span className="text-xs text-gray-400">#{train.trainNumber}</span>
                </div>
              </button>
            ))
          ) : selection.hasStationSelected ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">해당 역의 실시간 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">호선과 역을 선택해주세요.</p>
            </div>
          )}
        </div>

        {arrival.lastUpdated && (
          <p className="text-xs text-gray-500 text-center mt-3">
            마지막 업데이트: {arrival.lastUpdated.toLocaleTimeString()}
            {arrival.cached && <span className="ml-1">(캐시)</span>}
          </p>
        )}
      </div>

      {/* 좌석 현황 표시 */}
      {selection.hasTrainSelected && (
        <div className="p-4" style={{backgroundColor: 'white'}}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">{selection.selectedLine}</h3>
              <p className="text-sm text-gray-500">{selection.selectedStation}역 | {selection.selectedTrain.direction}</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold">#{selection.selectedTrain.trainNumber}</h3>
              <p className="text-sm" style={{color: '#C599B6'}}>{selection.selectedTrain.displayTime}</p>
            </div>
          </div>

          {/* SeatMap 컴포넌트가 실시간 좌석 정보를 모두 처리합니다. */}
          <SeatMap />

          {/* 즐겨찾기 및 예약 버튼 등 추가 UI는 여기에 유지할 수 있습니다. */}
          <div className="mt-6">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={favorites.toggleCurrentFavorite}
                className="flex-1 py-2 px-4 rounded-lg border transition-colors text-sm"
                style={{
                  borderColor: '#C599B6',
                  backgroundColor: favorites.isCurrentStationFavorite ? '#C599B6' : 'white',
                  color: favorites.isCurrentStationFavorite ? 'white' : '#C599B6'
                }}
              >
                {favorites.isCurrentStationFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              </button>
            </div>

            <button 
              className="w-full text-white py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{backgroundColor: '#C599B6'}}
              // disabled={seat.availableSeats === 0} // 이 로직은 SeatMap 내부나 상위 상태에서 다시 관리해야 합니다.
            >
              좌석 예약하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubwayDashboard;