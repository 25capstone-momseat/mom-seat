// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

export const AuthContext = createContext({
  user: null,
  name: '',
  loading: true,
  setDisplayName: async (_n) => {},
});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setName('');
        setLoading(false);
        return;
      }

      const dn = (u.displayName || '').trim();
      if (dn) {
        setName(dn);
        setLoading(false);
        return;
      }

      // fallback to backend profile
      try {
        const { data } = await api.get('/profile/me');
        setName((data && data.name) || '');
      } catch {
        setName('');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // helper to update both Auth + Firestore
  const setDisplayName = async (newName) => {
    if (!user) return;
    await updateProfile(user, { displayName: newName });
    try {
      await api.post('/profile', { name: newName, email: user.email || '' });
    } catch {
      // ignore backend failure for greeting
    }
    setName(newName);
  };

  return (
    <AuthContext.Provider value={{ user, name, loading, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export both ways so either `import AuthProvider ...` or `import { AuthProvider } ...` works
export { AuthProvider };
export default AuthProvider;
