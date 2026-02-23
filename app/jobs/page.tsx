'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Plus, Search, ExternalLink, Building, MapPin, Calendar, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  description: string | null;
  date_posted: string | null;
  created_at: string;
  applications?: Array<{
    id: string;
    status: string;
  }>;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    url: '',
    description: '',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, applications(*)')
      .order('created_at', { ascending: false });

    if (data) {
      setJobs(data);
      setFilteredJobs(data);
    }

    setLoading(false);
  };

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company) {
      toast({
        title: 'Error',
        description: 'Title and company are required',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title: newJob.title,
          company: newJob.company,
          location: newJob.location || null,
          url: newJob.url || null,
          description: newJob.description || null,
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add job',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      await supabase.from('applications').insert([
        {
          job_id: data.id,
          status: 'SAVED',
        },
      ]);
    }

    toast({
      title: 'Success',
      description: 'Job added successfully',
    });

    setNewJob({ title: '', company: '', location: '', url: '', description: '' });
    setIsAddDialogOpen(false);
    loadJobs();
  };

  const getStatusBadge = (job: Job) => {
    const app = job.applications?.[0];
    if (!app) return null;

    const statusColors: Record<string, string> = {
      SAVED: 'bg-slate-100 text-slate-700',
      APPLIED: 'bg-blue-100 text-blue-700',
      INTERVIEW: 'bg-amber-100 text-amber-700',
      OFFER: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
        {app.status}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
              <p className="mt-2 text-slate-600">Browse and manage job opportunities</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Job</DialogTitle>
                  <DialogDescription>Enter the details of the job you want to track</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="Senior Software Engineer"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      placeholder="Tech Corp"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Job URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://company.com/jobs/123"
                      value={newJob.url}
                      onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Job description and requirements..."
                      rows={6}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddJob}>Add Job</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-500 text-center">
                  {searchQuery ? 'No jobs found matching your search' : 'No jobs yet. Add your first job to get started!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link href={`/jobs/${job.id}`} className="hover:underline">
                            <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                          </Link>
                          {getStatusBadge(job)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
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
                        {job.description && (
                          <p className="text-slate-600 line-clamp-2">{job.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {job.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" asChild>
                          <Link href={`/jobs/${job.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
