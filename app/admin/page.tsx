'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, FileText, Link as LinkIcon, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Keyword = {
  id: string;
  phrase: string;
  location: string | null;
  remote_only: boolean;
  level: string;
  created_at: string;
};

type Source = {
  id: string;
  name: string;
  type: string;
  url: string | null;
  enabled: boolean;
  created_at: string;
  last_run_at: string | null;
  last_error: string | null;
  category: string;
  adapter: string;
  notes: string | null;
  homepage_url: string | null;
  robots_risk: string;
  default_enabled: boolean;
  is_catalog: boolean;
};

type Document = {
  id: string;
  type: string;
  filename: string;
  storage_path: string;
  created_at: string;
};

export default function AdminPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [catalogSources, setCatalogSources] = useState<Source[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [keywordDialog, setKeywordDialog] = useState(false);
  const [sourceDialog, setSourceDialog] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [adapterFilter, setAdapterFilter] = useState<string>('all');

  const [newKeyword, setNewKeyword] = useState({
    phrase: '',
    location: '',
    remote_only: false,
    level: 'MID',
  });

  const [newSource, setNewSource] = useState({
    name: '',
    type: 'MANUAL',
    url: '',
    category: 'GENERAL_BOARD',
    adapter: 'NONE',
    homepage_url: '',
    notes: '',
    robots_risk: 'MEDIUM',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [keywordsRes, sourcesRes, catalogRes, documentsRes] = await Promise.all([
      supabase.from('keywords').select('*').order('created_at', { ascending: false }),
      supabase.from('sources').select('*').eq('is_catalog', false).order('created_at', { ascending: false }),
      supabase.from('sources').select('*').eq('is_catalog', true).order('name', { ascending: true }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ]);

    if (keywordsRes.data) setKeywords(keywordsRes.data);
    if (sourcesRes.data) setSources(sourcesRes.data);
    if (catalogRes.data) setCatalogSources(catalogRes.data);
    if (documentsRes.data) setDocuments(documentsRes.data);

    setLoading(false);
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.phrase) {
      toast({
        title: 'Error',
        description: 'Phrase is required',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('keywords').insert([
      {
        phrase: newKeyword.phrase,
        location: newKeyword.location || null,
        remote_only: newKeyword.remote_only,
        level: newKeyword.level,
      },
    ]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add keyword',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Keyword added successfully',
    });

    setNewKeyword({ phrase: '', location: '', remote_only: false, level: 'MID' });
    setKeywordDialog(false);
    loadData();
  };

  const handleDeleteKeyword = async (id: string) => {
    const { error } = await supabase.from('keywords').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete keyword',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Keyword deleted',
    });

    loadData();
  };

  const handleAddSource = async () => {
    if (!newSource.name) {
      toast({
        title: 'Error',
        description: 'Source name is required',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('sources').insert([
      {
        name: newSource.name,
        type: newSource.type,
        url: newSource.url || null,
        category: newSource.category,
        adapter: newSource.adapter,
        homepage_url: newSource.homepage_url || null,
        notes: newSource.notes || null,
        robots_risk: newSource.robots_risk,
        is_catalog: false,
      },
    ]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add source',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Source added successfully',
    });

    setNewSource({
      name: '',
      type: 'MANUAL',
      url: '',
      category: 'GENERAL_BOARD',
      adapter: 'NONE',
      homepage_url: '',
      notes: '',
      robots_risk: 'MEDIUM',
    });
    setSourceDialog(false);
    loadData();
  };

  const handleDeleteSource = async (id: string) => {
    const { error } = await supabase.from('sources').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete source',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Source deleted',
    });

    loadData();
  };

  const handleToggleSource = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from('sources').update({ enabled }).eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update source',
        variant: 'destructive',
      });
      return;
    }

    loadData();
  };

  const handleDeleteDocument = async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Document deleted',
    });

    loadData();
  };

  const handleRunIngestion = async () => {
    setIngesting(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-rss`;
      const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Ingestion Complete',
          description: `Added ${result.totalJobsAdded} new job(s) from ${result.sourcesProcessed} source(s)`,
        });
      } else {
        toast({
          title: 'Ingestion Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to run ingestion: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleAddCatalogToMySources = async (catalogSource: Source) => {
    const { error } = await supabase.from('sources').insert([
      {
        name: catalogSource.name,
        type: catalogSource.type,
        category: catalogSource.category,
        adapter: catalogSource.adapter,
        homepage_url: catalogSource.homepage_url,
        robots_risk: catalogSource.robots_risk,
        default_enabled: catalogSource.default_enabled,
        enabled: true,
        is_catalog: false,
        url: null,
        notes: 'Added from catalog',
      },
    ]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add source to My Sources',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `${catalogSource.name} added to My Sources`,
    });

    loadData();
  };

  const filteredCatalogSources = catalogSources.filter((source) => {
    if (categoryFilter !== 'all' && source.category !== categoryFilter) return false;
    if (adapterFilter !== 'all' && source.adapter !== adapterFilter) return false;
    return true;
  });

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
            <p className="mt-2 text-slate-600">Manage keywords, sources, and documents</p>
          </div>

          <Tabs defaultValue="keywords" className="space-y-6">
            <TabsList>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Search Keywords</h2>
                  <p className="text-sm text-slate-600">Define keywords for job searching</p>
                </div>
                <Dialog open={keywordDialog} onOpenChange={setKeywordDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Keyword
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Search Keyword</DialogTitle>
                      <DialogDescription>Define a keyword for job search automation</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="phrase">Search Phrase *</Label>
                        <Input
                          id="phrase"
                          placeholder="Software Engineer"
                          value={newKeyword.phrase}
                          onChange={(e) => setNewKeyword({ ...newKeyword, phrase: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="San Francisco, CA"
                          value={newKeyword.location}
                          onChange={(e) => setNewKeyword({ ...newKeyword, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Experience Level</Label>
                        <Select
                          value={newKeyword.level}
                          onValueChange={(value) => setNewKeyword({ ...newKeyword, level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ENTRY">Entry Level</SelectItem>
                            <SelectItem value="MID">Mid Level</SelectItem>
                            <SelectItem value="SENIOR">Senior</SelectItem>
                            <SelectItem value="LEAD">Lead</SelectItem>
                            <SelectItem value="EXECUTIVE">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="remote"
                          checked={newKeyword.remote_only}
                          onCheckedChange={(checked) => setNewKeyword({ ...newKeyword, remote_only: checked })}
                        />
                        <Label htmlFor="remote">Remote only</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setKeywordDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKeyword}>Add Keyword</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {keywords.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500">
                      No keywords defined yet
                    </CardContent>
                  </Card>
                ) : (
                  keywords.map((keyword) => (
                    <Card key={keyword.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4 className="font-medium text-slate-900">{keyword.phrase}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span>{keyword.level}</span>
                            {keyword.location && <span>{keyword.location}</span>}
                            {keyword.remote_only && <span className="text-blue-600">Remote Only</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteKeyword(keyword.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Job Sources</h2>
                  <p className="text-sm text-slate-600">Manage RSS feeds and manual sources</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRunIngestion}
                  disabled={ingesting}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${ingesting ? 'animate-spin' : ''}`} />
                  {ingesting ? 'Running...' : 'Run Ingestion Now'}
                </Button>
              </div>

              <Tabs defaultValue="my-sources" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="my-sources">My Sources</TabsTrigger>
                  <TabsTrigger value="catalog">Catalog</TabsTrigger>
                </TabsList>

                <TabsContent value="my-sources" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog open={sourceDialog} onOpenChange={setSourceDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Source
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Job Source</DialogTitle>
                          <DialogDescription>Add a new source for job listings</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="source-name">Source Name *</Label>
                            <Input
                              id="source-name"
                              placeholder="Company Career Page"
                              value={newSource.name}
                              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="source-type">Type</Label>
                            <Select
                              value={newSource.type}
                              onValueChange={(value) => setNewSource({ ...newSource, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MANUAL">Manual</SelectItem>
                                <SelectItem value="RSS">RSS Feed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newSource.type === 'RSS' && (
                            <div className="space-y-2">
                              <Label htmlFor="source-url">RSS Feed URL</Label>
                              <Input
                                id="source-url"
                                type="url"
                                placeholder="https://example.com/jobs/feed"
                                value={newSource.url}
                                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSourceDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddSource}>Add Source</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-4">
                    {sources.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-slate-500">
                          No sources configured yet. Add from the Catalog or create a custom source.
                        </CardContent>
                      </Card>
                    ) : (
                      sources.map((source) => (
                        <Card key={source.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-slate-100 rounded">
                                  {source.type === 'RSS' ? (
                                    <LinkIcon className="h-5 w-5 text-slate-600" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-slate-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-slate-900">{source.name}</h4>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                    <span>{source.category}</span>
                                    <span>•</span>
                                    <span>{source.adapter}</span>
                                    {source.url && (
                                      <>
                                        <span>•</span>
                                        <a
                                          href={source.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline truncate max-w-xs"
                                        >
                                          {source.url}
                                        </a>
                                      </>
                                    )}
                                  </div>
                                  {source.type === 'RSS' && (
                                    <div className="mt-2 space-y-1">
                                      {source.last_run_at && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                          <Clock className="h-3 w-3" />
                                          Last run: {new Date(source.last_run_at).toLocaleString()}
                                        </div>
                                      )}
                                      {source.last_error && (
                                        <div className="flex items-start gap-1 text-xs text-red-600">
                                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                          <span className="line-clamp-2">{source.last_error}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={source.enabled}
                                  onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                                />
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(source.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="catalog" className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Ethical Job Ingestion</p>
                      <p className="text-sm text-amber-800 mt-1">
                        Avoid scraping protected job boards. Prefer RSS feeds, ATS feeds, and company career pages with proper API access or structured data.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="category-filter">Filter by Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger id="category-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="GENERAL_BOARD">General Boards</SelectItem>
                          <SelectItem value="TECH_BOARD">Tech Boards</SelectItem>
                          <SelectItem value="CYBER_BOARD">Cyber Boards</SelectItem>
                          <SelectItem value="REMOTE_BOARD">Remote Boards</SelectItem>
                          <SelectItem value="GOVERNMENT">Government</SelectItem>
                          <SelectItem value="COMPANY_ATS">Company ATS</SelectItem>
                          <SelectItem value="AGGREGATOR">Aggregators</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="adapter-filter">Filter by Adapter</Label>
                      <Select value={adapterFilter} onValueChange={setAdapterFilter}>
                        <SelectTrigger id="adapter-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Adapters</SelectItem>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="RSS_ATOM">RSS/Atom</SelectItem>
                          <SelectItem value="XML_GENERIC">XML Generic</SelectItem>
                          <SelectItem value="JOBPOSTING_JSONLD">JobPosting JSON-LD</SelectItem>
                          <SelectItem value="ATS_GREENHOUSE">Greenhouse</SelectItem>
                          <SelectItem value="ATS_LEVER">Lever</SelectItem>
                          <SelectItem value="ATS_WORKABLE">Workable</SelectItem>
                          <SelectItem value="ATS_SMARTRECRUITERS">SmartRecruiters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredCatalogSources.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-slate-500">
                          No sources match your filters
                        </CardContent>
                      </Card>
                    ) : (
                      filteredCatalogSources.map((catalogSource) => (
                        <Card key={catalogSource.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{catalogSource.name}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                                    {catalogSource.category.replace('_', ' ')}
                                  </span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    {catalogSource.adapter}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    catalogSource.robots_risk === 'HIGH'
                                      ? 'bg-red-100 text-red-700'
                                      : catalogSource.robots_risk === 'MEDIUM'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {catalogSource.robots_risk} Risk
                                  </span>
                                </div>
                                {catalogSource.homepage_url && (
                                  <a
                                    href={catalogSource.homepage_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline mt-1 block"
                                  >
                                    {catalogSource.homepage_url}
                                  </a>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddCatalogToMySources(catalogSource)}
                              >
                                Add to My Sources
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
                  <p className="text-sm text-slate-600">Manage resumes and cover letters</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <div className="grid gap-4">
                {documents.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500">
                      No documents uploaded yet
                    </CardContent>
                  </Card>
                ) : (
                  documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded">
                            <FileText className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{doc.filename}</h4>
                            <p className="text-sm text-slate-600">{doc.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
