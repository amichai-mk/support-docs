import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

export default function CreateArticleDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState('');
  const [moduleOptions, setModuleOptions] = useState(DEFAULT_MODULE_OPTIONS);
  const [idFormat, setIdFormat] = useState(DEFAULT_ID_FORMAT);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [moduleUsageCounts, setModuleUsageCounts] = useState({});

  useEffect(() => {
    if (open) {
      const loadSettingsAndUsage = async () => {
        const [settings, articles] = await Promise.all([
          base44.entities.AppSettings.filter({ setting_key: 'template_config' }),
          base44.entities.Article.list()
        ]);
        
        if (settings.length > 0 && settings[0].setting_value) {
          const config = settings[0].setting_value;
          if (config.module_options) setModuleOptions(config.module_options);
          if (config.article_id_format) setIdFormat(config.article_id_format);
        }

        // Count module usage from articles
        const counts = {};
        articles.forEach(article => {
          if (article.article_id) {
            const match = article.article_id.match(/KCS-([A-Z]+)-/);
            if (match) {
              counts[match[1]] = (counts[match[1]] || 0) + 1;
            }
          }
        });
        setModuleUsageCounts(counts);
      };
      loadSettingsAndUsage();
    }
  }, [open]);

  // Modules are already sorted by admin in settings, just return as-is
  const getSortedModules = () => moduleOptions;

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
      resolutions: [{ title: '', steps: [], verification: '' }],
      tags: []
    });
    
    onOpenChange(false);
    navigate(createPageUrl('EditArticle') + `?id=${article.id}`);
  };

  const handleCreateWithAI = async () => {
    if (!selectedModule || !aiPrompt.trim()) {
      toast.error('Please select a module and describe the issue');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const generatedId = await generateArticleId(selectedModule);
      const productArea = moduleOptions.find(m => m.value === selectedModule)?.label || '';
      
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a KCS (Knowledge-Centered Service) article writer for EPR FireWorks software support.
        
Based on this issue description: "${aiPrompt}"

Generate a structured KCS article with the following sections:
1. Title: A clear, searchable title (max 100 chars)
2. Issue: A concise problem statement (max 150 chars)
3. Environment: Technical context in this format:
   Back-Office: [value]
   Table: [relevant table/module]
   Frequency: [how often this occurs]
   Interfaces: [affected interfaces]
4. Cause: Root cause explanation (max 300 chars)
5. Resolution: Step-by-step fix (max 7 steps, each step should be a single clear action)
6. Verification: How to confirm the issue is resolved

Product Area: ${productArea}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            issue: { type: "string" },
            environment: { type: "string" },
            cause: { type: "string" },
            resolution_steps: { 
              type: "array", 
              items: { type: "string" }
            },
            verification: { type: "string" },
            tags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const article = await base44.entities.Article.create({
        article_id: generatedId,
        title: aiResponse.title || 'Untitled Article',
        issue: aiResponse.issue || '',
        environment: aiResponse.environment || '',
        cause: aiResponse.cause || '',
        resolutions: [{
          title: '',
          steps: (aiResponse.resolution_steps || []).map(step => ({ text: step, image: null })),
          verification: aiResponse.verification || ''
        }],
        status: 'draft',
        product_area: productArea,
        tags: aiResponse.tags || []
      });
      
      toast.success('Article generated with AI!');
      onOpenChange(false);
      navigate(createPageUrl('EditArticle') + `?id=${article.id}`);
    } catch (error) {
      toast.error('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedModule('');
    setAiPrompt('');
    setActiveTab('manual');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Article</DialogTitle>
          <DialogDescription>
            Select a module to generate the article ID
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="w-4 h-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create with AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module..." />
                </SelectTrigger>
                <SelectContent>
                  {getSortedModules().map((mod) => (
                    <SelectItem key={mod.value} value={mod.value}>
                      <span className="font-mono mr-2">{mod.value}</span>
                      <span className="text-gray-500">- {mod.label}</span>
                      {moduleUsageCounts[mod.value] > 0 && (
                        <span className="ml-2 text-xs text-gray-400">({moduleUsageCounts[mod.value]})</span>
                      )}
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
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : 'Create Article'}
            </Button>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module..." />
                </SelectTrigger>
                <SelectContent>
                  {getSortedModules().map((mod) => (
                    <SelectItem key={mod.value} value={mod.value}>
                      <span className="font-mono mr-2">{mod.value}</span>
                      <span className="text-gray-500">- {mod.label}</span>
                      {moduleUsageCounts[mod.value] > 0 && (
                        <span className="ml-2 text-xs text-gray-400">({moduleUsageCounts[mod.value]})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Describe the Issue</label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the problem, symptoms, and any relevant context. The AI will generate a complete KCS article based on your description..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-gray-500">
                Be specific about the issue, affected areas, and any known solutions
              </p>
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
              onClick={handleCreateWithAI} 
              disabled={!selectedModule || !aiPrompt.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Article with AI
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}