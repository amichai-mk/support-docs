import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileText, 
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExportSyncTab() {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [syncingTo, setSyncingTo] = useState(null);
  const [exporting, setExporting] = useState(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['published-articles'],
    queryFn: () => base44.entities.Article.filter({ status: 'published' }),
  });

  const toggleArticle = (id) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(a => a.id));
    }
  };

  const handleSync = async (platform) => {
    if (selectedArticles.length === 0) {
      toast.error('Please select articles to sync');
      return;
    }

    setSyncingTo(platform);
    try {
      const functionName = platform === 'hubspot' ? 'syncToHubspot' : 'syncToZoho';
      const response = await base44.functions.invoke(functionName, {
        articleIds: selectedArticles,
      });

      if (response.data.success) {
        toast.success(`Synced ${response.data.synced} articles to ${platform}`);
        if (response.data.failed > 0) {
          toast.warning(`${response.data.failed} articles failed to sync`);
        }
      } else {
        toast.error(response.data.error || `Failed to sync to ${platform}`);
      }
    } catch (error) {
      toast.error(error.message || `Failed to sync to ${platform}`);
    }
    setSyncingTo(null);
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await base44.functions.invoke('exportArticles', {
        format,
        articleIds: selectedArticles.length > 0 ? selectedArticles : null,
      });

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'kcs-articles-export.json');
      } else {
        const blob = new Blob([response.data], { 
          type: format === 'html' ? 'text/html' : 'text/csv' 
        });
        const filename = format === 'html' 
          ? 'kcs-articles-export.html'
          : `${format}-articles-export.csv`;
        downloadBlob(blob, filename);
      }
      
      toast.success(`Exported ${selectedArticles.length || articles.length} articles as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(error.message || 'Export failed');
    }
    setExporting(null);
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* API Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            API Sync
          </CardTitle>
          <CardDescription>
            Sync articles directly to external knowledge base platforms via API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HubSpot */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-medium">HubSpot</span>
                  </div>
                  <Badge variant="outline">Knowledge Base</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Sync articles to HubSpot CMS Knowledge Base
                </p>
                <Button 
                  onClick={() => handleSync('hubspot')}
                  disabled={syncingTo !== null}
                  className="w-full"
                >
                  {syncingTo === 'hubspot' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Sync to HubSpot</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Zoho */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">Zoho Desk</span>
                  </div>
                  <Badge variant="outline">Manual Export</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Export CSV for Zoho Desk bulk import
                </p>
                <Button 
                  onClick={() => handleExport('zoho')}
                  disabled={exporting !== null}
                  className="w-full"
                  variant="outline"
                >
                  {exporting === 'zoho' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Export Zoho CSV</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Manual Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Manual Export
          </CardTitle>
          <CardDescription>
            Export articles for manual import into external platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExport('hubspot')}
              disabled={exporting !== null}
            >
              {exporting === 'hubspot' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              HubSpot CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('zoho')}
              disabled={exporting !== null}
            >
              {exporting === 'zoho' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Zoho CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('json')}
              disabled={exporting !== null}
            >
              {exporting === 'json' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="w-4 h-4 mr-2" />
              )}
              JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('html')}
              disabled={exporting !== null}
            >
              {exporting === 'html' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              HTML
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Article Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Articles</CardTitle>
              <CardDescription>
                Choose which articles to sync or export (leave empty for all)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedArticles.length === articles.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No published articles found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {articles.map(article => (
                <div 
                  key={article.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleArticle(article.id)}
                >
                  <Checkbox 
                    checked={selectedArticles.includes(article.id)}
                    onCheckedChange={() => toggleArticle(article.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-sm text-gray-500">{article.article_id}</p>
                  </div>
                  {article.product_area && (
                    <Badge variant="secondary">{article.product_area}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedArticles.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}