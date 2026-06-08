'use client';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, RefreshCw } from 'lucide-react';
const MOCK_EVENTS = [
  { id: '1', event: 'case.status.updated', status: 'sent',    caseId: 'case_001', ts: '2026-06-08T10:00:00Z' },
  { id: '2', event: 'estimate.approved',   status: 'sent',    caseId: 'case_001', ts: '2026-06-08T11:00:00Z' },
  { id: '3', event: 'invoice.pending',     status: 'pending', caseId: 'case_001', ts: '2026-06-08T12:00:00Z' },
];
export default function IntegrationsPage() {
  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Webhook Log</h1>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" /> Outbound Events</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2">Event</th><th className="pb-2">Case</th><th className="pb-2">Status</th><th className="pb-2">Time</th><th /></tr></thead>
              <tbody>
                {MOCK_EVENTS.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{e.event}</td>
                    <td className="py-2 font-mono text-xs">{e.caseId}</td>
                    <td className="py-2"><Badge variant={e.status === 'sent' ? 'done' : e.status === 'failed' ? 'danger' : 'warn'}>{e.status}</Badge></td>
                    <td className="py-2 text-muted-foreground">{new Date(e.ts).toLocaleTimeString()}</td>
                    <td className="py-2">{e.status === 'failed' && <Button size="sm" variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Retry</Button>}</td>
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
