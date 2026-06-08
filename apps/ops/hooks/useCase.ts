'use client';

import { useEffect, useState } from 'react';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Case } from '@nrn/shared';

function sortByUpdated(cases: Case[]) {
  return cases.sort((a, b) => {
    const ts = (v: unknown) =>
      v && typeof v === 'object' && 'seconds' in (v as object)
        ? (v as { seconds: number }).seconds
        : 0;
    return ts(b.updatedAt) - ts(a.updatedAt);
  });
}

export function useCase(caseId: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;
    const unsub = onSnapshot(
      doc(db, 'cases', caseId),
      (snap) => {
        if (snap.exists()) setCaseData({ id: snap.id, ...snap.data() } as Case);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [caseId]);

  return { caseData, loading };
}

/** Ops sees all cases; optionally filter by workshopId */
export function useCases(workshopId?: string) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const casesRef = collection(db, 'cases');
    const q = workshopId
      ? query(casesRef, where('assignedWorkshopId', '==', workshopId))
      : query(casesRef);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
        setCases(sortByUpdated(all));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [workshopId]);

  return { cases, loading };
}
