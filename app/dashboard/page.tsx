'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

type Stats = {
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  total: number;
};

type ApplicationUpdate = {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  status: string;
  updated_at: string;
  applied_at: string | null;
  notes: string | null;
};

type WeeklyData = {
  week: string;
  applications: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    total: 0,
  });
  const [recentUpdates, setRecentUpdates] = useState<ApplicationUpdate[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  const [exportDialog, setExportDialog] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: applications } = await supabase
      .from('applications')
      .select('*, jobs(title, company)')
      .order('updated_at', { ascending: false });

    if (applications) {
      const newStats = {
        saved: applications.filter((a) => a.status === 'SAVED').length,
        applied: applications.filter((a) => a.status === 'APPLIED').length,
        interview: applications.filter((a) => a.status === 'INTERVIEW').length,
        offer: applications.filter((a) => a.status === 'OFFER').length,
        rejected: applications.filter((a) => a.status === 'REJECTED').length,
        total: applications.length,
      };
      setStats(newStats);

      const recent = applications.slice(0, 20).map((app: any) => ({
        id: app.id,
        job_id: app.job_id,
        job_title: app.jobs?.title || 'Unknown',
        company: app.jobs?.company || 'Unknown',
        status: app.status,
        updated_at: app.updated_at,
        applied_at: app.applied_at,
        notes: app.notes,
      }));
      setRecentUpdates(recent);

      const weekly = calculateWeeklyData(applications);
      setWeeklyData(weekly);
    }

    setLoading(false);
  };

  const calculateWeeklyData = (applications: any[]): WeeklyData[] => {
    const weeks: WeeklyData[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekApps = applications.filter((app) => {
        const createdAt = new Date(app.created_at);
        return createdAt >= weekStart && createdAt <= weekEnd;
      });

      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks.push({
        week: weekLabel,
        applications: weekApps.length,
      });
    }

    return weeks;
  };

  const handleExportCSV = async () => {
    let query = supabase
      .from('applications')
      .select('*, jobs(title, company, location, url)')
      .order('updated_at', { ascending: false });

    if (exportStatus !== 'all') {
      query = query.eq('status', exportStatus);
    }

    if (exportStartDate) {
      query = query.gte('updated_at', new Date(exportStartDate).toISOString());
    }

    if (exportEndDate) {
      const endDate = new Date(exportEndDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('updated_at', endDate.toISOString());
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      alert('No data to export with the selected filters');
      return;
    }

    const csvRows = [];
    csvRows.push([
      'Job Title',
      'Company',
      'Location',
      'Status',
      'Applied Date',
      'Updated Date',
      'Job URL',
      'Notes',
    ].join(','));

    data.forEach((app: any) => {
      const row = [
        `"${app.jobs?.title || ''}"`,
        `"${app.jobs?.company || ''}"`,
        `"${app.jobs?.location || ''}"`,
        app.status,
        app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '',
        new Date(app.updated_at).toLocaleDateString(),
        `"${app.jobs?.url || ''}"`,
        `"${(app.notes || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setExportDialog(false);
  };

  const statusCards = [
    { title: 'Saved', count: stats.saved, icon: Briefcase, color: 'text-slate-600', bgColor: 'bg-slate-100' },
    { title: 'Applied', count: stats.applied, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Interviews', count: stats.interview, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Offers', count: stats.offer, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Rejected', count: stats.rejected, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SAVED':
        return 'bg-slate-100 text-slate-700';
      case 'APPLIED':
        return 'bg-blue-100 text-blue-700';
      case 'INTERVIEW':
        return 'bg-amber-100 text-amber-700';
      case 'OFFER':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="mt-2 text-slate-600">Overview of your job application progress</p>
            </div>
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Applications</DialogTitle>
                  <DialogDescription>
                    Export your applications to CSV with optional filters
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Status Filter</Label>
                    <Select value={exportStatus} onValueChange={setExportStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="SAVED">Saved</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date (optional)</Label>
                    <input
                      id="start-date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date (optional)</Label>
                    <input
                      id="end-date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {statusCards.map((card) => (
                  <Card key={card.title} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{card.title}</p>
                          <p className="mt-2 text-3xl font-bold text-slate-900">{card.count}</p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor}`}>
                          <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Applications Per Week (Last 8 Weeks)</CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyData.length === 0 || weeklyData.every((w) => w.applications === 0) ? (
                    <p className="text-slate-500 text-center py-8">No application data yet</p>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="applications" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Application Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentUpdates.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No updates yet. Start by adding some jobs!</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentUpdates.map((update) => (
                            <TableRow key={update.id}>
                              <TableCell className="font-medium">
                                <Link href={`/jobs/${update.job_id}`} className="hover:underline">
                                  {update.job_title}
                                </Link>
                              </TableCell>
                              <TableCell>{update.company}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(update.status)}`}>
                                  {update.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {new Date(update.updated_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/jobs/${update.job_id}`}>View</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
