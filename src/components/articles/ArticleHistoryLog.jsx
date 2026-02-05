import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import StarRating from './StarRating';

export default function ArticleHistoryLog({ articleId }) {
  const [expandedItems, setExpandedItems] = useState({});

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['article-history', articleId],
    queryFn: () => base44.entities.ArticleHistory.filter({ article_id: articleId }, '-created_date'),
    enabled: !!articleId,
  });

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const actionColors = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    validated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    updated: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  if (isLoading) {
    return (
      <Card className="dark:bg-[#1a2a6c] dark:border-[#0e1b55]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="dark:bg-[#1a2a6c] dark:border-[#0e1b55]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No validation history yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-[#1a2a6c] dark:border-[#0e1b55]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
          <History className="w-5 h-5" />
          Version History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="border dark:border-[#0e1b55] rounded-lg p-3 bg-gray-50 dark:bg-[#0e1b55]"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={actionColors[entry.action_type]}>
                    {entry.action_type}
                  </Badge>
                  {entry.quality_rating && (
                    <StarRating rating={entry.quality_rating} readonly size="sm" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.validator_name || entry.validator_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.created_date).toLocaleDateString()} {new Date(entry.created_date).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {entry.changes_summary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(entry.id)}
                  className="dark:text-gray-300"
                >
                  {expandedItems[entry.id] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            {expandedItems[entry.id] && entry.changes_summary && (
              <div className="mt-3 pt-3 border-t dark:border-[#1a2a6c]">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Changes Summary:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {entry.changes_summary}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}