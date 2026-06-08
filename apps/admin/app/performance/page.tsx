'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Clock, CheckCircle, Download } from 'lucide-react';

export default function PerformancePage() {
  const stats = [
    { label: 'Avg Turnaround', value: '3.2 days', icon: Clock,       color: 'text-blue-600' },
    { label: 'SLA Compliance',  value: '94%',      icon: CheckCircle, color: 'text-green-600' },
    { label: 'Acceptance Rate', value: '89%',      icon: TrendingUp,  color: 'text-purple-600' },
    { label: 'Current Rating',  value: '4.7 ⭐',   icon: Star,        color: 'text-yellow-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Performance KPIs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />Export CSV</Button>
          <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Icon className={`mb-2 h-8 w-8 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Jobs Completed (Last 12 Weeks)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-2">
            {[4, 6, 3, 8, 5, 7, 9, 6, 4, 8, 7, 10].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--brand-primary)] transition-all"
                  style={{ height: `${(h / 10) * 130}px` }}
                />
                <span className="text-[10px] text-muted-foreground">W{i+1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
