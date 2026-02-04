import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';
import { Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1b55] transition-colors">
      <style>{`
        :root {
          --epr-navy: #0e1b55;
          --epr-red: #c41230;
          --epr-red-dark: #a30f28;
        }
        .dark {
          --background: 14 27 85;
          --foreground: 255 255 255;
        }
      `}</style>

      {/* Header with Logo */}
      <header className="bg-white dark:bg-[#1a2a6c] border-b border-gray-200 dark:border-[#0e1b55] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 dark:bg-[#1a2a6c]">
          <div className="w-10" />
          <Link to={createPageUrl('Dashboard')}>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698312b3fe9be2c697c692a1/eeb4e4b9a_ChatGPTImageFeb4202612_27_08PM.png" 
              alt="EPR FireWorks Support Team"
              className="h-16 dark:brightness-110 dark:contrast-110 cursor-pointer"
            />
          </Link>
          <div className="w-10 flex justify-end">
            {isAdmin && (
              <Link 
                to={createPageUrl('Settings')} 
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#0e1b55] transition-colors"
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