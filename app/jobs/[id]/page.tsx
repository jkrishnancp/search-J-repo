'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ExternalLink, Building, MapPin, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  description: string | null;
  date_posted: string | null;
  created_at: string;
};

type Application = {
  id: string;
  job_id: string;
  status: string;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = [
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('SAVED');

  useEffect(() => {
    loadJobDetails();
  }, [params.id]);

  const loadJobDetails = async () => {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (jobData) {
      setJob(jobData);
    }

    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', params.id)
      .maybeSingle();

    if (appData) {
      setApplication(appData);
      setStatus(appData.status);
      setNotes(appData.notes || '');
    }

    setLoading(false);
  };

  const handleUpdateApplication = async () => {
    if (!application) {
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            job_id: params.id,
            status,
            notes: notes || null,
            applied_at: status === 'APPLIED' ? new Date().toISOString() : null,
          },
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create application',
          variant: 'destructive',
        });
        return;
      }

      setApplication(data);
    } else {
      const updateData: any = {
        status,
        notes: notes || null,
      };

      if (status === 'APPLIED' && application.status !== 'APPLIED') {
        updateData.applied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', application.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update application',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Success',
      description: 'Application updated successfully',
    });

    loadJobDetails();
  };

  const handleDeleteJob = async () => {
    const { error } = await supabase.from('jobs').delete().eq('id', params.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Job deleted successfully',
    });

    router.push('/jobs');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SAVED: 'bg-slate-100 text-slate-700',
      APPLIED: 'bg-blue-100 text-blue-700',
      INTERVIEW: 'bg-amber-100 text-amber-700',
      OFFER: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.SAVED;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <p className="text-slate-500">Job not found</p>
            <Button className="mt-4" asChild>
              <Link href="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Job
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Job</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this job? This action cannot be undone and will also delete any
                    associated application data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteJob}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Added {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {job.url && (
                  <Button variant="outline" asChild>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Posting
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            {job.description && (
              <CardContent>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={`px-2 py-1 rounded ${getStatusColor(option.value)}`}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {application?.applied_at && (
                <div>
                  <Label>Applied On</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this application..."
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleUpdateApplication} className="w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
