import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../firebase";

function genId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function useCampeonato(campeonatoId, firebaseUser) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!campeonatoId) { setLoading(false); return; }
    const r = ref(db, `campeonatos/${campeonatoId}`);
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        setData(snap.val());
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    return unsub;
  }, [campeonatoId]);

  const write = useCallback(async (path, value) => {
    await set(ref(db, `campeonatos/${campeonatoId}/${path}`), value);
  }, [campeonatoId]);

  const createCampeonato = useCallback(async (name, adminUser) => {
    const id = genId();
    const inviteCode = genId();
    const adminParticipant = {
      uid: adminUser.uid,
      name: adminUser.displayName || adminUser.email,
      email: adminUser.email,
      photoURL: adminUser.photoURL || null,
      isAdmin: true,
      joinedAt: Date.now(),
    };
    await set(ref(db, `campeonatos/${id}`), {
      pool: { name, adminUid: adminUser.uid, inviteCode },
      participants: { [adminUser.uid]: adminParticipant },
      results: {},
      predictions: {},
      komatches: {},
    });
    return { id, inviteCode };
  }, []);

  const findByCode = useCallback(async (code) => {
    const snap = await get(ref(db, "campeonatos"));
    if (!snap.exists()) return null;
    const all = snap.val();
    const entry = Object.entries(all).find(
      ([, v]) => v?.pool?.inviteCode === code.toUpperCase()
    );
    return entry ? entry[0] : null;
  }, []);

  const joinCampeonato = useCallback(async (campId, user, displayName) => {
    const participant = {
      uid: user.uid,
      name: displayName || user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL || null,
      isAdmin: false,
      joinedAt: Date.now(),
    };
    await set(ref(db, `campeonatos/${campId}/participants/${user.uid}`), participant);
  }, []);

  return { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato };
}
