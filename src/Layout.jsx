import React from 'react';

export default function Layout({ children }) {
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
      <header className="bg-white dark:bg-[#0e1b55] border-b border-gray-200 dark:border-[#1a2a6c] sticky top-0 z-50 shadow-sm">
        <div className="flex justify-center py-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698312b3fe9be2c697c692a1/eeb4e4b9a_ChatGPTImageFeb4202612_27_08PM.png" 
            alt="EPR FireWorks Support Team"
            className="h-16"
          />
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}