import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useSubwayApp } from '../hooks/useSubwayUtils';
import SeatMap from '../components/SeatMap';
import styles from '../../styles/modules/SeatSearch.module.css';

const SeatSearch = () => {
  const { selection, arrival, seat, appState } = useSubwayApp();

  // UI 상태 (드롭다운 등)
  const [showLineDropdown, setShowLineDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showTrainDropdown, setShowTrainDropdown] = useState(false);

  const handleSelectLine = (line) => {
    selection.setSelectedLine(line.name || line);
    setShowLineDropdown(false);
    setShowStationDropdown(true); // 다음 단계로 유도
  };

  const handleSelectStation = (station) => {
    selection.setSelectedStation(station);
    setShowStationDropdown(false);
    setShowTrainDropdown(true); // 다음 단계로 유도
  };

  const handleSelectTrain = (train) => {
    selection.toggleTrainSelection(train);
    setShowTrainDropdown(false);
  };

  const handleReservation = () => {
    console.log('예약하기 클릭', selection.selectedTrain);
    // navigate 로직 추가 필요
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleMam}>맘</span>
          <span className={styles.titleRest}>편한자리</span>
        </h1>
      </div>

      {/* 실시간 좌석 조회 섹션 */}
      <div className={styles.searchSection}>
        <h2 className={styles.sectionTitle}>실시간 좌석 조회</h2>
        
        {/* 에러 메시지 */}
        {(selection.linesError || selection.stationsError || arrival.error) && (
          <div className={styles.errorMessage}>
            <p>{selection.linesError || selection.stationsError || arrival.error}</p>
          </div>
        )}

        {/* 선택 옵션들 */}
        <div className={styles.selectOptions}>
          {/* 노선 선택 */}
          <div className={styles.dropdownContainer}>
            <button
              onClick={() => setShowLineDropdown(!showLineDropdown)}
              className={styles.selectButton}
            >
              <span>{selection.selectedLine || '노선 선택'}</span>
              {showLineDropdown ? 
                <ChevronDown className={styles.chevron} /> : 
                <ChevronRight className={styles.chevron} />
              }
            </button>
            
            {showLineDropdown && (
              <div className={styles.dropdownMenu}>
                {selection.lines.map((line, index) => (
                  <button
                    key={line.id || index}
                    onClick={() => handleSelectLine(line)}
                    className={styles.dropdownItem}
                    style={{ color: line.color || '#333' }}
                  >
                    {line.name || line}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 행 선택 (역 선택) */}
          <div className={styles.dropdownContainer}>
            <button
              onClick={() => selection.hasLineSelected && setShowStationDropdown(!showStationDropdown)}
              disabled={!selection.hasLineSelected}
              className={`${styles.selectButton} ${!selection.hasLineSelected ? styles.disabled : ''}`}
            >
              <span>{selection.selectedStation || '행 선택'}</span>
              {showStationDropdown ? 
                <ChevronDown className={styles.chevron} /> : 
                <ChevronRight className={styles.chevron} />
              }
            </button>
            
            {showStationDropdown && (
              <div className={styles.dropdownMenu}>
                {selection.stations.map((station, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectStation(station)}
                    className={styles.dropdownItem}
                  >
                    {station}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 열차번호 선택 */}
          <div className={styles.dropdownContainer}>
            <button
              onClick={() => selection.hasStationSelected && setShowTrainDropdown(!showTrainDropdown)}
              disabled={!selection.hasStationSelected}
              className={`${styles.selectButton} ${!selection.hasStationSelected ? styles.disabled : ''}`}
            >
              <span>
                {selection.selectedTrain ? `${selection.selectedTrain.trainNumber}열차` : '열차번호 선택'}
              </span>
              {showTrainDropdown ? 
                <ChevronDown className={styles.chevron} /> : 
                <ChevronRight className={styles.chevron} />
              }
            </button>
            
            {showTrainDropdown && (
              <div className={styles.dropdownMenu}>
                {arrival.hasData ? (
                  Object.entries(arrival.groupedData).map(([direction, trains]) => (
                    <div key={direction} className={styles.dropdownGroup}>
                      <div className={styles.dropdownGroupHeader}>
                        {direction}
                      </div>
                      {trains.map((train, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTrain(train)}
                          className={styles.dropdownItem}
                        >
                          <div className={styles.trainInfo}>
                            <span className={styles.trainNumber}>
                              {train.trainNumber}열차
                            </span>
                            <span className={styles.trainDirection}>
                              {train.direction}행
                            </span>
                          </div>
                          <div className={styles.trainStatus}>
                            {train.status}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className={styles.noData}>도착 정보가 없습니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 열차 정보 및 좌석맵 */}
      {appState.canShowSeats && (
        <div className={styles.seatInfoSection}>
          <div className={styles.trainInfoCard}>
            <div className={styles.trainHeader}>
              <span className={styles.lineName}>{selection.selectedLine}</span>
              <span className={styles.trainName}>{selection.selectedTrain.trainNumber}열차</span>
            </div>
            
            <div className={styles.trainDateTime}>
              {new Date().toLocaleDateString('ko-KR')} | {new Date().toLocaleTimeString('ko-KR')} | {selection.selectedStation}
            </div>

            {/* 좌석 통계 */}
            {seat.occupancyInfo && (
              <div className={styles.seatStats}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{seat.totalSeats}</div>
                  <div className={styles.statLabel}>총 좌석</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{seat.occupancyInfo.occupied}</div>
                  <div className={styles.statLabel}>사용 중</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{seat.availableSeats}</div>
                  <div className={styles.statLabel}>사용가능한 좌석</div>
                </div>
              </div>
            )}

            {/* SeatMap 컴포넌트가 들어갈 자리 */}
            <div className={styles.seatMapContainer}>
              <SeatMap />
            </div>

            {/* 범례 */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.available}`}></div>
                <span>예약 가능</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.occupied}`}></div>
                <span>사용중인 좌석</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.selected}`}></div>
                <span>예약된 좌석</span>
              </div>
            </div>
          </div>

          {/* 예약하기 버튼 */}
          <button
            onClick={handleReservation}
            disabled={seat.availableSeats === 0}
            className={styles.reserveButton}
          >
            {seat.availableSeats > 0 ? '예약하기' : '예약 가능한 좌석 없음'}
          </button>
        </div>
      )}

      {/* 로딩 표시 */}
      {(selection.isLoadingLines || selection.isLoadingStations || arrival.isLoading || seat.isLoading) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSearch;