import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../firebase";

export function useUserCampeonatos(firebaseUser) {
  const [campeonatos, setCampeonatos] = useState([]);
  useEffect(() => {
    if (!firebaseUser) { setCampeonatos([]); return; }
    const uid = firebaseUser.uid;
    const r = ref(db, `userCampeonatos/${uid}`);
    const unsub = onValue(r, async (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setCampeonatos(Object.entries(val).map(([id, c]) => ({ id, name: c.name })));
        return;
      }
      // backfill para campeonatos antigos criados antes do índice existir
      try {
        const allSnap = await get(ref(db, "campeonatos"));
        if (!allSnap.exists()) { setCampeonatos([]); return; }
        const all = allSnap.val();
        const mine = Object.entries(all).filter(([, c]) => c?.participants?.[uid]);
        for (const [id, c] of mine) {
          await set(ref(db, `userCampeonatos/${uid}/${id}`), {
            name: c.pool?.name || id,
            joinedAt: c.participants[uid]?.joinedAt || Date.now(),
          });
        }
        // onValue dispara novamente após os writes
      } catch {
        setCampeonatos([]);
      }
    });
    return unsub;
  }, [firebaseUser]);
  return campeonatos;
}

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
    const now = Date.now();
    const adminParticipant = {
      uid: adminUser.uid,
      name: adminUser.displayName || adminUser.email,
      email: adminUser.email,
      photoURL: adminUser.photoURL || null,
      isAdmin: true,
      joinedAt: now,
    };
    await set(ref(db, `campeonatos/${id}`), {
      pool: { name, adminUid: adminUser.uid, inviteCode },
      participants: { [adminUser.uid]: adminParticipant },
      results: {},
      predictions: {},
      komatches: {},
    });
    await set(ref(db, `userCampeonatos/${adminUser.uid}/${id}`), { name, joinedAt: now });
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
    const now = Date.now();
    const participant = {
      uid: user.uid,
      name: displayName || user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL || null,
      isAdmin: false,
      joinedAt: now,
    };
    await set(ref(db, `campeonatos/${campId}/participants/${user.uid}`), participant);
    const nameSnap = await get(ref(db, `campeonatos/${campId}/pool/name`));
    const campName = nameSnap.exists() ? nameSnap.val() : campId;
    await set(ref(db, `userCampeonatos/${user.uid}/${campId}`), { name: campName, joinedAt: now });
  }, []);

  return { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato };
}
