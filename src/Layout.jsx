import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';
import { Settings, BookOpen } from 'lucide-react';

export default function Layout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 dark:bg-slate-800">
          <div className="w-10" />
          <Link to={createPageUrl('Dashboard')}>
            <span className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
              Support Docs
            </span>
          </Link>
          <div className="flex items-center gap-2">
                            <Link 
                              to={createPageUrl('ArticleLibrary')} 
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              title="Knowledge Base"
                            >
                              <BookOpen className="w-5 h-5" />
                            </Link>
                            {isAdmin && (
                              <Link 
                                to={createPageUrl('Settings')} 
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              >
                                <Settings className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}