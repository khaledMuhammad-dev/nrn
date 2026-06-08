'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Briefcase, Calendar, TrendingUp, Star, Wifi, WifiOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [availability, setAvailability] = useState<'open' | 'busy' | 'closed'>('open');
  const [stats, setStats] = useState({ activeJobs: 0, todayAppointments: 0, slaCompliance: 98, avgRating: 4.7 });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!profile?.workshopId) return;
    api.get(`/workshops/${profile.workshopId}`)
      .then((r) => setAvailability(r.data.data?.availability ?? 'open'))
      .catch(() => {});
  }, [profile]);

  const handleAvailabilityChange = async (status: 'open' | 'busy' | 'closed') => {
    if (!profile?.workshopId) return;
    setUpdating(true);
    try {
      await api.post(`/workshops/${profile.workshopId}/availability`, { status });
      setAvailability(status);
      toast.success(`Status changed to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const kpis = [
    { label: 'Active Jobs',        value: stats.activeJobs,        icon: Briefcase,  color: 'text-blue-600' },
    { label: "Today's Appts",      value: stats.todayAppointments, icon: Calendar,   color: 'text-green-600' },
    { label: 'SLA Compliance',     value: `${stats.slaCompliance}%`, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Average Rating',     value: stats.avgRating.toFixed(1), icon: Star,     color: 'text-yellow-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Availability Toggle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4" /> Workshop Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['open', 'busy', 'closed'] as const).map((s) => (
              <Button
                key={s}
                size="lg"
                disabled={updating}
                onClick={() => handleAvailabilityChange(s)}
                className={
                  availability === s
                    ? s === 'open' ? 'bg-green-600 text-white hover:bg-green-700'
                    : s === 'busy' ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    : ''
                }
                variant={availability === s ? 'default' : 'outline'}
              >
                {s === 'open' ? <Wifi className="mr-2 h-4 w-4" /> : <WifiOff className="mr-2 h-4 w-4" />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Current status: <Badge variant={availability === 'open' ? 'done' : availability === 'busy' ? 'warn' : 'danger'} className="capitalize">{availability}</Badge>
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Icon className={`mb-2 h-8 w-8 ${color}`} />
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
