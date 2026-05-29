import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, off } from "firebase/database";

export const DEFAULT_RULES = {
  exactScore:  { active: true,  points: 3 },
  result:      { active: true,  points: 1 },
  yellowCards: { active: true,  points: 1, predType: "exact", label: "Cartões Amarelos" },
  expulsions:  { active: true,  points: 2, predType: "boolean", label: "Haverá expulsão?" },
};

export function useRules(campeonatoId) {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campeonatoId) { setLoading(false); return; }
    const r = ref(db, `campeonatos/${campeonatoId}/rules`);
    const unsub = onValue(r, snap => {
      setRules(snap.exists() ? { ...DEFAULT_RULES, ...snap.val() } : DEFAULT_RULES);
      setLoading(false);
    });
    return () => off(r, "value", unsub);
  }, [campeonatoId]);

  return { rules, loading };
}
