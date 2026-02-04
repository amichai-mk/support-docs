import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentAnalytics() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list(),
  });

  // Calculate metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const myArticlesThisMonth = articles?.filter(article => {
    const articleDate = new Date(article.created_date);
    return (
      article.created_by === user?.email &&
      articleDate.getMonth() === currentMonth &&
      articleDate.getFullYear() === currentYear
    );
  })?.length || 0;

  // Calculate team average
  const allArticlesThisMonth = articles?.filter(article => {
    const articleDate = new Date(article.created_date);
    return (
      articleDate.getMonth() === currentMonth &&
      articleDate.getFullYear() === currentYear
    );
  }) || [];

  const uniqueAuthors = [...new Set(allArticlesThisMonth.map(a => a.created_by))];
  const teamAverage = uniqueAuthors.length > 0 
    ? Math.round(allArticlesThisMonth.length / uniqueAuthors.length) 
    : 0;

  const metrics = [
    {
      title: 'My Articles This Month',
      value: myArticlesThisMonth,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Team Average',
      value: teamAverage,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Ticket Queue',
      value: '—',
      subtitle: 'Integration pending',
      icon: Inbox,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Success Rate',
      value: '—',
      subtitle: 'Integration pending',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metric.title}</p>
                <p className="text-3xl font-bold mt-1 dark:text-white">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-400 mt-1">{metric.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}