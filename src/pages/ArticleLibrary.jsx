import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import UserHeader from '../components/common/UserHeader';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Clock, Tag, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticleLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['published-articles'],
    queryFn: () => base44.entities.Article.filter({ status: 'published' }, '-updated_date'),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings-modules'],
    queryFn: () => base44.entities.AppSettings.filter({ setting_key: 'template_config' }),
  });

  const moduleOptions = settings[0]?.setting_value?.module_options || [];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.article_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = moduleFilter === 'all' || article.product_area === moduleFilter;
    
    return matchesSearch && matchesModule;
  });

  // Group articles by module
  const groupedArticles = filteredArticles.reduce((acc, article) => {
    const module = article.product_area || 'Uncategorized';
    if (!acc[module]) acc[module] = [];
    acc[module].push(article);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1b55]">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="dark:text-white dark:hover:bg-[#1a2a6c]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <UserHeader />
          </div>
          <h1 className="text-3xl font-bold text-[#0e1b55] dark:text-white mb-2">Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-300">Search and browse published KCS articles</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, issue, article ID, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 text-lg dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:text-white"
            />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:text-white">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {moduleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c41230]" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredArticles.length === 0 && (
          <Card className="dark:bg-[#1a2a6c] dark:border-[#0e1b55]">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'No published articles available yet'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Articles List - Grouped by Module */}
        {!isLoading && Object.keys(groupedArticles).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedArticles).map(([module, moduleArticles]) => (
              <div key={module}>
                <h2 className="text-lg font-semibold text-[#0e1b55] dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c41230]" />
                  {module}
                  <Badge variant="outline" className="ml-2">{moduleArticles.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {moduleArticles.map(article => (
                    <Link 
                      key={article.id}
                      to={createPageUrl(`ViewArticle?id=${article.id}`)}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-all hover:border-[#c41230] cursor-pointer dark:bg-[#1a2a6c] dark:border-[#0e1b55] dark:hover:border-[#c41230]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#0e1b55] px-2 py-0.5 rounded">
                                  {article.article_id}
                                </span>
                              </div>
                              <h3 className="font-semibold text-[#0e1b55] dark:text-white mb-1">
                                {article.title}
                              </h3>
                              {article.issue && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                                  {article.issue}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(article.updated_date).toLocaleDateString()}
                                </span>
                                {article.tags?.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {article.tags.slice(0, 3).join(', ')}
                                    {article.tags.length > 3 && ` +${article.tags.length - 3}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}