import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Tag, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ViewArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const articles = await base44.entities.Article.filter({ id: articleId });
      return articles[0];
    },
    enabled: !!articleId,
  });

  const handleCopy = async () => {
    let text = '';
    text += `Article ID: ${article.article_id || 'N/A'}\n`;
    text += `Title: ${article.title || 'Untitled'}\n\n`;
    if (article.issue) text += `== ISSUE ==\n${article.issue}\n\n`;
    if (article.environment) text += `== ENVIRONMENT ==\n${article.environment}\n\n`;
    if (article.cause) text += `== CAUSE ==\n${article.cause}\n\n`;
    if (article.resolutions?.length > 0) {
      text += `== RESOLUTION ==\n`;
      article.resolutions.forEach((res, i) => {
        if (res.steps?.length) {
          if (article.resolutions.length > 1) text += `\n${res.title || `Option ${i + 1}`}\n`;
          res.steps.forEach((step, j) => {
            const stepText = typeof step === 'string' ? step : step?.text || '';
            text += `${j + 1}. ${stepText}\n`;
          });
          if (res.verification) text += `Verification: ${res.verification}\n`;
        }
      });
    }
    await navigator.clipboard.writeText(text);
    toast.success('Article copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0e1b55] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c41230]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0e1b55] p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article not found</h1>
          <Link to={createPageUrl('ArticleLibrary')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1b55]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link to={createPageUrl('ArticleLibrary')}>
            <Button variant="ghost" className="dark:text-white dark:hover:bg-[#1a2a6c]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <Button variant="outline" onClick={handleCopy} className="dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:text-white">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>

        {/* Article Content */}
        <Card className="dark:bg-[#1a2a6c] dark:border-[#0e1b55]">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#0e1b55] px-2 py-1 rounded">
                  {article.article_id}
                </span>
                {article.product_area && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {article.product_area}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#0e1b55] dark:text-white mb-3">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {new Date(article.updated_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Issue */}
            {article.issue && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b-2 border-red-500">
                  Issue
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{article.issue}</p>
              </div>
            )}

            {/* Environment */}
            {article.environment && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b-2 border-blue-500">
                  Environment
                </h2>
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                  {article.environment}
                </pre>
              </div>
            )}

            {/* Cause */}
            {article.cause && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b-2 border-yellow-500">
                  Cause
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{article.cause}</p>
              </div>
            )}

            {/* Resolution */}
            {article.resolutions?.length > 0 && article.resolutions.some(r => r.steps?.length > 0) && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b-2 border-green-500">
                  Resolution
                </h2>
                {article.resolutions.map((resolution, resIndex) => {
                  if (!resolution.steps?.length) return null;
                  const hasMultiple = article.resolutions.length > 1;
                  return (
                    <div key={resIndex} className={hasMultiple ? 'mb-6' : ''}>
                      {hasMultiple && (
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          {resolution.title || `Option ${resIndex + 1}`}
                        </h3>
                      )}
                      <ol className="list-decimal list-inside space-y-3 mb-4">
                        {resolution.steps.map((step, stepIndex) => {
                          const stepText = typeof step === 'string' ? step : step?.text || '';
                          const stepImage = typeof step === 'object' ? step?.image : null;
                          return (
                            <li key={stepIndex} className="text-gray-700 dark:text-gray-300">
                              {stepText}
                              {stepImage && (
                                <img src={stepImage} alt={`Step ${stepIndex + 1}`} className="mt-2 ml-4 max-h-64 rounded border" />
                              )}
                            </li>
                          );
                        })}
                      </ol>
                      {resolution.verification && (
                        <p className="text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                          <strong>Verification:</strong> {resolution.verification}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Visual Assets */}
            {article.visual_assets?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b-2 border-purple-500">
                  Visual Aids
                </h2>
                <div className="space-y-4">
                  {article.visual_assets.map((asset, index) => (
                    <div key={index} className="border dark:border-[#0e1b55] rounded-lg p-3 bg-gray-50 dark:bg-[#0e1b55]">
                      {asset.type === 'image' && (
                        <img src={asset.url} alt={asset.caption || 'Visual asset'} className="w-full rounded" />
                      )}
                      {asset.type === 'video' && (
                        <video src={asset.url} controls className="w-full rounded" />
                      )}
                      {asset.type === 'youtube' && (
                        <div className="aspect-video">
                          <iframe
                            src={asset.url.replace('watch?v=', 'embed/')}
                            className="w-full h-full rounded"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {asset.caption && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{asset.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="pt-4 border-t dark:border-[#0e1b55]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="dark:border-[#0e1b55] dark:text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}