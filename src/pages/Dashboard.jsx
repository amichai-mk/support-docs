import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AgentAnalytics from '../components/dashboard/AgentAnalytics';
import AISearchBar from '../components/dashboard/AISearchBar';
import ArticlesLibrary from '../components/dashboard/ArticlesLibrary';
import ArticleFilters from '../components/dashboard/ArticleFilters';
import IntegrationLinks from '../components/dashboard/IntegrationLinks';
import DarkModeToggle from '../components/dashboard/DarkModeToggle';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productAreaFilter, setProductAreaFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KCS Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your knowledge articles</p>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            <Button 
              onClick={() => navigate(createPageUrl('CreateArticle'))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        {/* Analytics */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Agent Analytics</h2>
          <AgentAnalytics />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Articles Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Articles Library</h2>
              <ArticleFilters 
                statusFilter={statusFilter}
                productAreaFilter={productAreaFilter}
                onStatusChange={setStatusFilter}
                onProductAreaChange={setProductAreaFilter}
              />
            </div>
            
            <AISearchBar onSearch={handleSearch} />
            
            <ArticlesLibrary 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              productAreaFilter={productAreaFilter}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <IntegrationLinks />
          </div>
        </div>
      </div>
    </div>
  );
}