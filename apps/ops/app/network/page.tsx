'use client';

import { useState, useEffect } from 'react';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Workshop } from '@nrn/shared';
import { Network, Star, ShieldCheck, ShieldX } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function NetworkPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workshops').then((r) => setWorkshops(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (ws: Workshop) => {
    const newStatus = ws.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/workshops/${ws.id}`, { status: newStatus });
      setWorkshops((prev) => prev.map((w) => w.id === ws.id ? { ...w, status: newStatus } : w));
      toast.success(`Workshop ${newStatus}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Workshop Network</h1>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Network className="h-4 w-4" /> Workshops ({workshops.length})</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Services</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Rating</th>
                  <th className="pb-2 font-medium">Availability</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {workshops.map((ws) => (
                  <tr key={ws.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{ws.name}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {ws.services.map((s) => <Badge key={s} variant="secondary" className="capitalize text-xs">{s}</Badge>)}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={ws.status === 'active' ? 'done' : 'danger'}>{ws.status}</Badge>
                    </td>
                    <td className="py-3 font-mono">{ws.score}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {ws.rating}
                      </div>
                    </td>
                    <td className="py-3 capitalize">{ws.availability ?? 'open'}</td>
                    <td className="py-3">
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(ws)} className="gap-1">
                        {ws.status === 'active'
                          ? <><ShieldX className="h-3 w-3 text-red-500" />Suspend</>
                          : <><ShieldCheck className="h-3 w-3 text-green-500" />Activate</>
                        }
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </OpsLayout>
  );
}
