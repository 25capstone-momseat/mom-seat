// frontend/src/contexts/AppContext.jsx
import React from 'react';
import { AuthProvider } from './AuthContext'; // 기존 인증 Context
import { ReservationProvider } from './ReservationContext'; // 기존 예약 Context
import { SubwayProvider } from './SubwayContext'; // 새로 만든 지하철 Context

/**
 * 모든 Context Provider를 통합하는 최상위 Provider
 * 앱의 모든 전역 상태를 관리합니다.
 */
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <ReservationProvider>
        <SubwayProvider>
          {children}
        </SubwayProvider>
      </ReservationProvider>
    </AuthProvider>
  );
}

// 통합된 Hook들을 export
export { useSubwayContext } from './SubwayContext';
// export { useAuthContext } from './AuthContext'; // 기존 Auth Hook
// export { useReservationContext } from './ReservationContext'; // 기존 Reservation Hook

/**
 * 앱 전체 상태를 한 번에 사용할 수 있는 통합 Hook
 * 필요한 Context만 선택적으로 사용 가능
 */
export function useAppContext() {
  // const auth = useAuthContext();
  // const reservation = useReservationContext();
  const subway = useSubwayContext();
  
  return {
    // auth,
    // reservation,
    subway
  };
}