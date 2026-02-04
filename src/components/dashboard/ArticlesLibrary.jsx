import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-react';

const statusConfig = {
  draft: { icon: FileText, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  review: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  published: { icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  archived: { icon: Archive, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export default function ArticlesLibrary({ searchTerm, statusFilter, productAreaFilter }) {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list('-updated_date'),
  });

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.issue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === 'all' || article.status === statusFilter;
    const matchesProductArea = !productAreaFilter || productAreaFilter === 'all' || article.product_area === productAreaFilter;
    
    return matchesSearch && matchesStatus && matchesProductArea;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No articles found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Create your first article to get started'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredArticles.map((article) => {
        const status = statusConfig[article.status] || statusConfig.draft;
        const StatusIcon = status.icon;

        return (
          <Link 
            key={article.id} 
            to={createPageUrl(`EditArticle?id=${article.id}`)}
            className="block"
          >
            <Card className="hover:shadow-md transition-all hover:border-[#c41230] dark:hover:border-[#c41230] cursor-pointer border-gray-200 dark:border-[#1a2a6c] dark:bg-[#1a2a6c]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {article.article_id || 'Draft'}
                      </span>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {article.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-[#0e1b55] dark:text-white truncate">
                      {article.title || 'Untitled Article'}
                    </h3>
                    {article.issue && (
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 line-clamp-1">
                        {article.issue}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {article.product_area && (
                        <span className="bg-[#0e1b55]/10 dark:bg-[#0e1b55] text-[#0e1b55] dark:text-white px-2 py-0.5 rounded">
                          {article.product_area}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(article.updated_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 rounded-full bg-[#0e1b55]/10 dark:bg-[#0e1b55] flex items-center justify-center">
                      <span className="text-sm font-bold text-[#0e1b55] dark:text-white">
                        {article.completeness_score || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}