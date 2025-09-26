// frontend/src/hooks/useCertificate.js
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * certificates/{uid} 문서를 실시간 구독하는 훅
 * @param {string} uid
 * @returns {object|null}
 */
export function useCertificate(uid) {
  const [cert, setCert] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'certificates', uid);
    const unsub = onSnapshot(ref, (snap) => {
      setCert(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [uid]);

  return cert;
}
