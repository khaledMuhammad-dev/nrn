'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Workshop } from '@nrn/shared';
import { Star, ChevronRight, Search, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';

export default function WorkshopsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { t }   = useTranslation();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const debouncedSearch           = useDebounce(search, 300);

  useEffect(() => {
    api.get('/workshops', { params: { search: debouncedSearch, filter } })
      .then((r) => setWorkshops(r.data.data ?? []))
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filter]);

  const FILTERS = [
    { value: 'all',      label: t('workshops.filters.all') },
    { value: 'open',     label: t('workshops.filters.open') },
    { value: 'top_rated',label: t('workshops.filters.top_rated') },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{t('workshops.title')}</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('workshops.searchPlaceholder')}
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'brand' : 'outline'}
            onClick={() => setFilter(f.value)}
            className="shrink-0"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
      ) : (
        workshops.map((ws, idx) => (
          <motion.div
            key={ws.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className="cursor-pointer p-4 hover:shadow-md transition-shadow"
              onClick={() => router.push(`/accidents/${id}/workshops/${ws.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{ws.name}</span>
                    {ws.status === 'active' && (
                      <ShieldCheck className="h-4 w-4 text-blue-500" aria-label={t('workshops.verified')} />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-yellow-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{ws.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">· {ws.location.address}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ws.services.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                    ))}
                    <Badge
                      variant={(ws as Workshop & { availability?: string }).availability === 'open' ? 'done' : 'warn'}
                      className="text-xs"
                    >
                      {(ws as Workshop & { availability?: string }).availability === 'open'
                        ? t('workshops.available')
                        : t('workshops.busy')}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
