'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Boxes } from 'lucide-react';

export default function CapacityPage() {
  const { profile } = useAuth();
  const [config, setConfig] = useState({ bays: 8, technicians: 12, maxConcurrentJobs: 6 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.workshopId) return;
    api.get(`/workshops/${profile.workshopId}`)
      .then((r) => { if (r.data.data?.capacity) setConfig(r.data.data.capacity); });
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.workshopId) return;
    setSaving(true);
    try {
      await api.patch(`/workshops/${profile.workshopId}`, { capacity: config });
      toast.success('Capacity updated');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Capacity Configuration</h1>
      <Card className="max-w-md">
        <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-4 w-4" /> Bay & Staff Settings</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Service Bays</Label>
            <Input type="number" min={1} value={config.bays} onChange={(e) => setConfig((p) => ({ ...p, bays: +e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Technicians</Label>
            <Input type="number" min={1} value={config.technicians} onChange={(e) => setConfig((p) => ({ ...p, technicians: +e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Max Concurrent Jobs</Label>
            <Input type="number" min={1} value={config.maxConcurrentJobs} onChange={(e) => setConfig((p) => ({ ...p, maxConcurrentJobs: +e.target.value }))} />
          </div>
          <Button onClick={handleSave} disabled={saving} variant="brand">
            {saving ? 'Saving…' : 'Save Capacity'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
