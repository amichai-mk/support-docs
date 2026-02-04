import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ArticleEditor from '../components/articles/ArticleEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_MODULE_OPTIONS = [
  { value: 'PER', label: 'Personnel' },
  { value: 'INC', label: 'Incidents' },
  { value: 'REP', label: 'Reporting' },
  { value: 'SCH', label: 'Scheduling' },
  { value: 'INV', label: 'Inventory' },
  { value: 'TRN', label: 'Training' },
  { value: 'ADM', label: 'Admin' },
  { value: 'INT', label: 'Integrations' },
  { value: 'GEN', label: 'General' },
];

const DEFAULT_ID_FORMAT = 'KCS-{MODULE}-{NUMBER}-DB';

export default function CreateArticle() {
  const navigate = useNavigate();
  const [articleId, setArticleId] = useState(null);
  const [selectedModule, setSelectedModule] = useState('');
  const [moduleOptions, setModuleOptions] = useState(DEFAULT_MODULE_OPTIONS);
  const [idFormat, setIdFormat] = useState(DEFAULT_ID_FORMAT);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load settings
    const loadSettings = async () => {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'template_config' });
      if (settings.length > 0 && settings[0].setting_value) {
        const config = settings[0].setting_value;
        if (config.module_options) setModuleOptions(config.module_options);
        if (config.article_id_format) setIdFormat(config.article_id_format);
      }
    };
    loadSettings();
  }, []);

  const generateArticleId = async (module) => {
    const allArticles = await base44.entities.Article.list();
    const nextNumber = allArticles.length + 1;
    const now = new Date();
    
    return idFormat
      .replace('{MODULE}', module)
      .replace('{NUMBER}', String(nextNumber).padStart(4, '0'))
      .replace('{YEAR}', String(now.getFullYear()))
      .replace('{MONTH}', String(now.getMonth() + 1).padStart(2, '0'));
  };

  const handleCreateArticle = async () => {
    if (!selectedModule) return;
    
    setIsCreating(true);
    const generatedId = await generateArticleId(selectedModule);
    
    const article = await base44.entities.Article.create({
      article_id: generatedId,
      title: 'Untitled Article',
      issue: '',
      status: 'draft',
      product_area: moduleOptions.find(m => m.value === selectedModule)?.label || '',
      resolution_steps: [],
      tags: []
    });
    setArticleId(article.id);
  };

  if (!articleId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Dashboard'))}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle>Create New Article</CardTitle>
                <CardDescription>Select a module to generate the article ID</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module..." />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map((mod) => (
                    <SelectItem key={mod.value} value={mod.value}>
                      <span className="font-mono mr-2">{mod.value}</span>
                      <span className="text-gray-500">- {mod.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedModule && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Article ID will be:</p>
                <p className="font-mono font-semibold text-lg">
                  {idFormat
                    .replace('{MODULE}', selectedModule)
                    .replace('{NUMBER}', 'XXXX')
                    .replace('{YEAR}', String(new Date().getFullYear()))
                    .replace('{MONTH}', String(new Date().getMonth() + 1).padStart(2, '0'))}
                </p>
              </div>
            )}

            <Button 
              onClick={handleCreateArticle} 
              disabled={!selectedModule || isCreating}
              className="w-full bg-[#c41230] hover:bg-[#a30f28]"
            >
              {isCreating ? 'Creating...' : 'Create Article'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ArticleEditor articleId={articleId} />;
}