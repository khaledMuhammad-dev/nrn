'use client';

import { useEffect, useState } from 'react';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Case } from '@nrn/shared';

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
      (_err) => setLoading(false),
    );
    return unsub;
  }, [caseId]);

  return { caseData, loading };
}

export function useCases(customerId?: string, workshopId?: string) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't subscribe until we have an ID — avoids unfiltered queries and premature loading state
    if (!customerId && !workshopId) {
      setLoading(false);
      return;
    }

    const casesRef = collection(db, 'cases');
    let q;
    if (customerId) {
      q = query(casesRef, where('customerId', '==', customerId));
    } else {
      q = query(casesRef, where('assignedWorkshopId', '==', workshopId));
    }

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
        // Sort client-side to avoid needing Firestore composite indexes
        all.sort((a, b) => {
          const aTime = typeof a.createdAt === 'object' && 'seconds' in (a.createdAt as object)
            ? (a.createdAt as { seconds: number }).seconds : 0;
          const bTime = typeof b.createdAt === 'object' && 'seconds' in (b.createdAt as object)
            ? (b.createdAt as { seconds: number }).seconds : 0;
          return bTime - aTime;
        });
        setCases(all);
        setLoading(false);
      },
      (_err) => {
        // On error (security rules, missing index) stop the skeleton
        setLoading(false);
      },
    );
    return unsub;
  }, [customerId, workshopId]);

  return { cases, loading };
}
