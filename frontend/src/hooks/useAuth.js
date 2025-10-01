import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // currentUser를 user로 매핑하고 loading 상태도 반환합니다.
  return { currentUser: context.user, loading: context.loading, ...context };
};
