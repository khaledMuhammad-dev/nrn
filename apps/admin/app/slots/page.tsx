'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Slot } from '@nrn/shared';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function SlotsPage() {
  const { profile } = useAuth();
  const [slots, setSlots]   = useState<Slot[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newCap, setNewCap]   = useState(2);
  const [newTw, setNewTw]     = useState('09:00–12:00');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!profile?.workshopId) return;
    api.get(`/workshops/${profile.workshopId}/slots`)
      .then((r) => setSlots(r.data.data ?? []));
  }, [profile]);

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    acc[s.date] = [...(acc[s.date] ?? []), s];
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!newDate || !profile?.workshopId) return;
    setSaving(true);
    try {
      const r = await api.post(`/workshops/${profile.workshopId}/slots`, {
        date: newDate, timeWindow: newTw, capacity: newCap, bookedCount: 0,
      });
      setSlots((prev) => [...prev, r.data.data]);
      toast.success('Slot added');
    } catch { toast.error('Failed to add slot'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Slot Management</h1>

      {/* Add Slot Form */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Slot</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-40" />
          <Input placeholder="Time window e.g. 09:00–12:00" value={newTw} onChange={(e) => setNewTw(e.target.value)} className="w-48" />
          <Input type="number" min={1} max={20} value={newCap} onChange={(e) => setNewCap(Number(e.target.value))} className="w-24" placeholder="Capacity" />
          <Button onClick={handleAdd} disabled={saving} variant="brand">
            {saving ? 'Adding…' : 'Add Slot'}
          </Button>
        </CardContent>
      </Card>

      {/* Slots Calendar View */}
      {Object.entries(grouped).map(([date, daySlots]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {daySlots.map((s) => (
              <div key={s.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{s.timeWindow}</p>
                <p className="text-muted-foreground">{s.bookedCount}/{s.capacity} booked</p>
                <div className={`mt-1 h-1.5 rounded-full ${s.bookedCount >= s.capacity ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(s.bookedCount / s.capacity) * 100}%` }} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
