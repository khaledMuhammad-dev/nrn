'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function SchedulePage() {
  const { profile } = useAuth();
  const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>({
    Sunday: { open: '08:00', close: '18:00' },
    Monday: { open: '08:00', close: '18:00' },
    Tuesday: { open: '08:00', close: '18:00' },
    Wednesday: { open: '08:00', close: '18:00' },
    Thursday: { open: '08:00', close: '18:00' },
    Friday: null,
    Saturday: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.workshopId) return;
    api.get(`/workshops/${profile.workshopId}`)
      .then((r) => { if (r.data.data?.capacity?.workingHours) setHours(r.data.data.capacity.workingHours); });
  }, [profile]);

  const toggleDay = (day: string) => {
    setHours((prev) => ({ ...prev, [day]: prev[day] ? null : { open: '08:00', close: '18:00' } }));
  };

  const handleSave = async () => {
    if (!profile?.workshopId) return;
    setSaving(true);
    try {
      await api.patch(`/workshops/${profile.workshopId}`, { 'capacity.workingHours': hours });
      toast.success('Schedule updated');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Working Hours</h1>
      <Card className="max-w-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {DAYS.map((day) => {
            const dayHours = hours[day];
            return (
              <div key={day} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day)}
                  className={cn('w-28 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors', dayHours ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400 line-through')}
                >
                  {day.slice(0, 3)}
                </button>
                {dayHours ? (
                  <>
                    <Input type="time" value={dayHours.open} className="w-28" onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day]!, open: e.target.value } }))} />
                    <span className="text-muted-foreground">–</span>
                    <Input type="time" value={dayHours.close} className="w-28" onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day]!, close: e.target.value } }))} />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            );
          })}
          <Button onClick={handleSave} disabled={saving} variant="brand" className="mt-2">
            {saving ? 'Saving…' : 'Save Schedule'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
