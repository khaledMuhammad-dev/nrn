'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const DEFAULT_ITEMS = [
  { label: 'Re-assembling', done: false, technicalNotes: '' },
  { label: 'Body Fixing',   done: false, technicalNotes: '' },
  { label: 'Painting',      done: false, technicalNotes: '' },
  { label: 'Final Assembly', done: false, technicalNotes: '' },
];

export default function WorkOrderPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [marking, setMarking] = useState(false);

  const progress    = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  const allDone     = items.every((i) => i.done);

  const toggle = (idx: number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  const setNotes = (idx: number, notes: string) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, technicalNotes: notes } : item));
  };

  const handleComplete = async () => {
    setMarking(true);
    try {
      await api.post(`/cases/${id}/complete`, { checklistItems: items });
      toast.success('Vehicle marked as ready for pickup!');
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Work Order Checklist</h1>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>Progress</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}>
          <Progress value={progress} className="h-3" />
        </motion.div>
      </Card>

      {/* Checklist */}
      {items.map((item, idx) => (
        <Card key={item.label} className={cn('p-4 transition-all', item.done && 'border-green-200 bg-green-50 dark:bg-green-950/20')}>
          <button
            className="flex w-full items-center gap-3 text-left"
            onClick={() => toggle(idx)}
          >
            {item.done
              ? <CheckSquare className="h-5 w-5 shrink-0 text-green-600" />
              : <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
            }
            <span className={cn('font-medium', item.done && 'line-through text-muted-foreground')}>
              {item.label}
            </span>
          </button>
          {item.done && (
            <div className="mt-3">
              <Textarea
                placeholder="Technician notes (optional)"
                rows={2}
                value={item.technicalNotes}
                onChange={(e) => setNotes(idx, e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </Card>
      ))}

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            size="xl"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
            disabled={marking}
          >
            {marking ? 'Marking ready…' : '✓ Mark Ready for Pickup'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
