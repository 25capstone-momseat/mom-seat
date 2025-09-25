import React from 'react';
import { MapPin, Clock, RefreshCw } from 'lucide-react';
import { useSubwayApp } from '../hooks/useSubwayUtils';
import SeatMap from '../components/SeatMap';
import styles from '../../styles/modules/SubwayDashboard.module.css';

const SubwayDashboard = () => {
  const { 
    selection, 
    arrival, 
    favorites,
    refreshAll 
  } = useSubwayApp();

  const getStatusClass = (status) => {
    switch(status) {
      case '곧 도착': return styles.soon;
      case '운행중': return styles.running;
      default: return styles.default;
    }
  };

  const handleCancel = () => {
    // 선택된 열차 정보 초기화 - 현재 선택된 열차를 다시 토글하여 선택 해제
    if (selection.selectedTrain) {
      selection.toggleTrainSelection(selection.selectedTrain);
    }
    // 또는 이전 페이지로 이동
    // window.history.back();
  };

  return (
    <div className={styles.container}>

      {/* 지하철 실시간 도착 정보 섹션 */}
      <div className={styles.mainSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>실시간 지하철 도착 정보</h2>
          <button 
            onClick={refreshAll}
            className={styles.refreshButton}
            disabled={arrival.isLoading}
          >
            <RefreshCw className={`${styles.refreshIcon} ${arrival.isLoading ? styles.spinning : ''}`} />
          </button>
        </div>

        {/* 필터 선택 */}
        <div className={styles.filterGrid}>
          <div>
            <label className={styles.filterLabel}>호선</label>
            <select 
              value={selection.selectedLine} 
              onChange={(e) => selection.setSelectedLine(e.target.value)}
              className={styles.filterSelect}
              disabled={selection.isLoadingLines}
            >
              <option value="">호선 선택</option>
              {selection.lines.map(line => (
                <option key={line.id} value={line.name}>{line.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.filterLabel}>역명</label>
            <select 
              value={selection.selectedStation} 
              onChange={(e) => selection.setSelectedStation(e.target.value)}
              className={styles.filterSelect}
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
          <div className={styles.favoritesSection}>
            <p className={styles.favoritesLabel}>즐겨찾는 역</p>
            <div className={styles.favoritesWrapper}>
              {favorites.favorites.slice(0, 3).map((fav, index) => (
                <button
                  key={index}
                  onClick={() => selection.selectStationWithLine(fav.stationName, fav.lineName)}
                  className={`${styles.favoriteButton} ${selection.selectedStation === fav.stationName ? styles.active : ''}`}
                >
                  {fav.lineName} {fav.stationName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {(selection.linesError || selection.stationsError || arrival.error) && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>
              {selection.linesError || selection.stationsError || arrival.error}
            </p>
          </div>
        )}

        {/* 실시간 도착 정보 */}
        <div className={styles.arrivalList}>
          {arrival.isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>데이터를 불러오는 중...</p>
            </div>
          ) : arrival.hasData ? (
            arrival.arrivalData.map((train, index) => (
              <button 
                key={index} 
                onClick={() => selection.toggleTrainSelection(train)}
                className={`${styles.trainCard} ${selection.isTrainSelected(train.trainNumber) ? styles.selected : ''}`}
              >
                <div className={styles.trainCardHeader}>
                  <div className={styles.trainDirection}>
                    <MapPin className={styles.mapIcon} />
                    <span className={styles.directionText}>{train.direction}</span>
                    {train.isArriving && (
                      <span className={styles.arrivingSoon}>
                        곧 도착
                      </span>
                    )}
                  </div>
                  <span className={`${styles.statusText} ${getStatusClass(train.status)}`}>
                    {train.status}
                  </span>
                </div>
                <div className={styles.trainCardDetails}>
                  <Clock className={styles.clockIcon} />
                  <span className={styles.timeText}>{train.displayTime}</span>
                  <span className={styles.trainNumber}>#{train.trainNumber}</span>
                </div>
              </button>
            ))
          ) : selection.hasStationSelected ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>해당 역의 실시간 정보가 없습니다.</p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>호선과 역을 선택해주세요.</p>
            </div>
          )}
        </div>

        {arrival.lastUpdated && (
          <p className={styles.updateInfo}>
            마지막 업데이트: {arrival.lastUpdated.toLocaleTimeString()}
            {arrival.cached && <span className={styles.cachedLabel}>(캐시)</span>}
          </p>
        )}
      </div>

      {/* 좌석 현황 표시 */}
      {selection.hasTrainSelected && (
        <div className={styles.seatSection}>
          <div className={styles.seatHeader}>
            <div className={styles.seatHeaderLeft}>
              <h3>{selection.selectedLine}</h3>
              <p>{selection.selectedStation}역 | {selection.selectedTrain.direction}</p>
            </div>
            <div className={styles.seatHeaderRight}>
              <h3>#{selection.selectedTrain.trainNumber}</h3>
              <p>{selection.selectedTrain.displayTime}</p>
            </div>
          </div>

          {/* SeatMap 컴포넌트가 실시간 좌석 정보를 모두 처리합니다. */}
          <SeatMap />

          {/* 버튼 섹션 */}
          <div className={styles.buttonSection}>
            <div className={styles.buttonRow}>
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                취소하기
              </button>
            </div>

            <button 
              className={styles.reserveButton}
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