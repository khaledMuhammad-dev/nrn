'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2 } from 'lucide-react';

interface Member { id: string; name: string; role: string; contact: string; }

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Khalid Al-Rashid', role: 'advisor',    contact: '+966501234567' },
    { id: '2', name: 'Fahad Al-Otaibi',  role: 'technician', contact: '+966507654321' },
  ]);
  const [form, setForm] = useState({ name: '', role: 'technician', contact: '' });

  const add = () => {
    if (!form.name) return;
    setMembers((p) => [...p, { id: Date.now().toString(), ...form }]);
    setForm({ name: '', role: 'technician', contact: '' });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Team Management</h1>

      {/* Add Member */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" /> Add Member</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-48" />
          <select className="rounded-md border px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="advisor">Advisor</option>
            <option value="technician">Technician</option>
          </select>
          <Input placeholder="+966..." value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} className="w-40" />
          <Button onClick={add} variant="brand">Add</Button>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Staff ({members.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Contact</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{m.name}</td>
                  <td className="py-3"><Badge variant="secondary" className="capitalize">{m.role}</Badge></td>
                  <td className="py-3 text-muted-foreground">{m.contact}</td>
                  <td className="py-3">
                    <Button variant="ghost" size="icon" onClick={() => setMembers((p) => p.filter((x) => x.id !== m.id))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
