'use client';

import { useEffect, useState } from 'react';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Case } from '@nrn/shared';
import api from '@/lib/axios';

type FilterGroup = 'all' | 'active' | 'pickup' | 'closed';

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

export function useCases(customerId?: string, workshopId?: string, filter: FilterGroup = 'all') {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId && !workshopId) {
      setLoading(false);
      return;
    }

    // For customer filtered views: call the API route which applies the filter server-side.
    // For 'all' (or workshop queries): use onSnapshot for real-time updates.
    if (customerId && filter !== 'all') {
      setLoading(true);
      api
        .get<{ cases: Case[] }>(`/cases?customerId=${customerId}&filter=${filter}`)
        .then((res) => setCases(res.data.cases))
        .catch(() => setCases([]))
        .finally(() => setLoading(false));
      return;
    }

    const casesRef = collection(db, 'cases');
    const q = customerId
      ? query(casesRef, where('customerId', '==', customerId))
      : query(casesRef, where('assignedWorkshopId', '==', workshopId));

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
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
      (_err) => setLoading(false),
    );
    return unsub;
  }, [customerId, workshopId, filter]);

  return { cases, loading };
}
