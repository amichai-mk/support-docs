import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { FileText, Users, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];

export default function InsightsTab() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['articles-insights'],
    queryFn: () => base44.entities.Article.list('-created_date'),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-insights'],
    queryFn: () => base44.entities.User.list(),
  });

  const isLoading = articlesLoading || usersLoading;

  // Calculate metrics
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;
  const reviewArticles = articles.filter(a => a.status === 'review').length;

  const avgCompleteness = articles.length > 0
    ? Math.round(articles.reduce((sum, a) => sum + (a.completeness_score || 0), 0) / articles.length)
    : 0;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Published', value: publishedArticles },
    { name: 'Draft', value: draftArticles },
    { name: 'Review', value: reviewArticles },
    { name: 'Archived', value: articles.filter(a => a.status === 'archived').length },
  ].filter(d => d.value > 0);

  // Articles per product area
  const productAreaData = articles.reduce((acc, article) => {
    const area = article.product_area || 'Uncategorized';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const productAreaChartData = Object.entries(productAreaData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Articles created over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = startOfDay(subDays(date, -1));
    const count = articles.filter(a => {
      const created = new Date(a.created_date);
      return isAfter(created, dayStart) && !isAfter(created, dayEnd);
    }).length;
    return {
      date: format(date, 'MMM d'),
      articles: count
    };
  });

  // Top contributors
  const contributorData = articles.reduce((acc, article) => {
    const author = article.created_by || 'Unknown';
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});

  const topContributors = Object.entries(contributorData)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Incomplete articles (below 100%)
  const incompleteArticles = articles
    .filter(a => (a.completeness_score || 0) < 100 && a.status !== 'published')
    .sort((a, b) => (a.completeness_score || 0) - (b.completeness_score || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalArticles}</p>
                <p className="text-sm text-gray-500">Total Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedArticles}</p>
                <p className="text-sm text-gray-500">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftArticles}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCompleteness}%</p>
                <p className="text-sm text-gray-500">Avg Completeness</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles Created (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="articles" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Areas and Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Articles by Product Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productAreaChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Users with the most articles created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={contributor.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-sm">{contributor.email}</span>
                  </div>
                  <Badge>{contributor.count} articles</Badge>
                </div>
              ))}
              {topContributors.length === 0 && (
                <p className="text-gray-500 text-center py-4">No contributors yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incomplete Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Articles Needing Attention
          </CardTitle>
          <CardDescription>Draft articles with lowest completeness scores</CardDescription>
        </CardHeader>
        <CardContent>
          {incompleteArticles.length > 0 ? (
            <div className="space-y-3">
              {incompleteArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{article.title || 'Untitled'}</h4>
                    <p className="text-sm text-gray-500">{article.article_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${article.completeness_score || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{article.completeness_score || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">All articles are complete!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}