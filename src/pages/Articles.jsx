import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, CheckCircle, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';

export default function Articles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productAreaFilter, setProductAreaFilter] = useState('all');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list('-updated_date'),
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.issue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesProductArea = productAreaFilter === 'all' || article.product_area === productAreaFilter;
    
    return matchesSearch && matchesStatus && matchesProductArea;
  });

  const statusIcons = {
    draft: <Clock className="w-4 h-4" />,
    review: <FileText className="w-4 h-4" />,
    published: <CheckCircle className="w-4 h-4" />,
    archived: <Archive className="w-4 h-4" />
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    review: 'bg-blue-100 text-blue-800 border-blue-300',
    published: 'bg-green-100 text-green-800 border-green-300',
    archived: 'bg-orange-100 text-orange-800 border-orange-300'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KCS Article Library</h1>
            <p className="text-gray-600 mt-1">IECR Knowledge Base Management</p>
          </div>
          <Link to={createPageUrl('CreateArticle')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles by title or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={productAreaFilter} onValueChange={setProductAreaFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Product Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="Personnel">Personnel</SelectItem>
                  <SelectItem value="Incidents">Incidents</SelectItem>
                  <SelectItem value="Reporting">Reporting</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No articles found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map(article => (
              <Link key={article.id} to={createPageUrl('EditArticle') + `?id=${article.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2">{article.issue}</p>
                      </div>
                      <Badge className={`${statusColors[article.status]} border flex items-center gap-1 ml-4`}>
                        {statusIcons[article.status]}
                        {article.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                      {article.product_area && (
                        <Badge variant="outline">{article.product_area}</Badge>
                      )}
                      {article.completeness_score !== undefined && (
                        <span className="flex items-center gap-1">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${article.completeness_score}%` }}
                            />
                          </div>
                          <span className="text-xs">{article.completeness_score}%</span>
                        </span>
                      )}
                      <span className="ml-auto">
                        Updated {format(new Date(article.updated_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}