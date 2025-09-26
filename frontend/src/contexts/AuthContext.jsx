// frontend/src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

export const AuthContext = createContext({
  user: null,
  name: '',
  loading: true,
  updateName: async (_n) => {},
  refreshUserProfile: async () => {},
});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setName('');
      setLoading(false);
      return;
    }
    // Prioritize backend profile as the source of truth
    try {
      const { data } = await api.get('/profile/me');
      const backendName = (data?.user?.name) ? data.user.name.trim() : '';
      if (backendName) {
        setName(backendName);
      } else {
        // Fallback to displayName if backend has no name
        setName((currentUser.displayName || '').trim());
      }
    } catch {
      // Fallback to displayName on API error
      setName((currentUser.displayName || '').trim());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await fetchUserProfile(u);
    });
    return () => unsub();
  }, [fetchUserProfile]);

  // helper to update name in local state, auth, and backend
  const updateName = async (newName) => {
    if (!user) return;
    
    setName(newName); // Update local state
    await updateProfile(user, { displayName: newName }); // Update Firebase Auth

    try { // Update backend
      await api.put('/profile/me', { name: newName });
    } catch {
      // ignore backend failure
    }
  };

  const refreshUserProfile = useCallback(async () => {
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser);
    }
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, name, loading, updateName, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
export default AuthProvider;