import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import MetadataSection from './MetadataSection';
import IssueSection from './IssueSection';
import EnvironmentSection from './EnvironmentSection';
import CauseSection from './CauseSection';
import ResolutionSection from './ResolutionSection';
import PreviewPanel from './PreviewPanel';
import ValidationPanel from './ValidationPanel';
import VisualAssetsSection from './VisualAssetsSection';
import { calculateCompleteness } from './validation';
import debounce from 'lodash/debounce';

export default function ArticleEditor({ articleId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('edit');
  const [formData, setFormData] = useState({});
  const [validationIssues, setValidationIssues] = useState([]);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => base44.entities.Article.get(articleId),
    enabled: !!articleId,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        article_id: article.article_id || '',
        title: article.title || '',
        issue: article.issue || '',
        environment: article.environment || '',
        cause: article.cause || '',
        resolution_steps: article.resolution_steps || [],
        verification: article.verification || '',
        visual_assets: article.visual_assets || [],
        status: article.status || 'draft',
        product_area: article.product_area || '',
        tags: article.tags || [],
      });
    }
  }, [article]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Article.update(articleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['article', articleId]);
    },
  });

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce(async (data) => {
      const completeness = calculateCompleteness(data);
      await updateMutation.mutateAsync({
        ...data,
        completeness_score: completeness,
        last_auto_save: new Date().toISOString(),
      });
    }, 2000),
    [articleId]
  );

  useEffect(() => {
    if (formData.title) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const completeness = calculateCompleteness(formData);
    await updateMutation.mutateAsync({
      ...formData,
      completeness_score: completeness,
    });
    toast.success('Article saved successfully');
  };

  const handlePublish = async () => {
    const completeness = calculateCompleteness(formData);
    
    if (completeness < 100) {
      toast.error('Article must be 100% complete before publishing');
      return;
    }

    if (formData.resolution_steps.length >= 10) {
      toast.error('Cannot publish: Too many steps. Please consolidate to 9 or fewer steps.');
      return;
    }

    await updateMutation.mutateAsync({
      ...formData,
      status: 'published',
      completeness_score: completeness,
    });
    
    toast.success('Article published successfully');
    navigate(createPageUrl('Articles'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completeness = calculateCompleteness(formData);

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Articles'))}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {article?.article_id || 'Generating...'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{formData.title || 'Untitled Article'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                    <span>{completeness}% complete</span>
                  </div>
                  {article?.last_auto_save && (
                    <span className="text-xs text-gray-500">
                      Auto-saved {new Date(article.last_auto_save).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
                disabled={completeness < 100 || formData.resolution_steps.length >= 10}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-6 mt-6">
                <MetadataSection 
                  formData={formData}
                  onChange={handleFieldChange}
                />
                
                <IssueSection 
                  value={formData.issue}
                  onChange={(value) => handleFieldChange('issue', value)}
                  onValidation={(issues) => setValidationIssues(prev => 
                    [...prev.filter(i => !i.field?.includes('issue')), ...issues]
                  )}
                />
                
                <EnvironmentSection 
                  value={formData.environment}
                  onChange={(value) => handleFieldChange('environment', value)}
                  onValidation={(issues) => setValidationIssues(prev => 
                    [...prev.filter(i => !i.field?.includes('environment')), ...issues]
                  )}
                />
                
                <CauseSection 
                  value={formData.cause}
                  onChange={(value) => handleFieldChange('cause', value)}
                  onValidation={(issues) => setValidationIssues(prev => 
                    [...prev.filter(i => !i.field?.includes('cause')), ...issues]
                  )}
                />
                
                <ResolutionSection 
                  steps={formData.resolution_steps}
                  verification={formData.verification}
                  onStepsChange={(steps) => handleFieldChange('resolution_steps', steps)}
                  onVerificationChange={(value) => handleFieldChange('verification', value)}
                  onValidation={(issues) => setValidationIssues(prev => 
                    [...prev.filter(i => !i.field?.includes('resolution')), ...issues]
                  )}
                />

                <VisualAssetsSection 
                  assets={formData.visual_assets || []}
                  onChange={(assets) => handleFieldChange('visual_assets', assets)}
                />
                </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <PreviewPanel formData={formData} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ValidationPanel 
              formData={formData}
              completeness={completeness}
              validationIssues={validationIssues}
            />
          </div>
        </div>
      </div>
    </div>
  );
}