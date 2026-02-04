import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="flex justify-center py-2">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698312b3fe9be2c697c692a1/5ae7cc8f8_ChatGPTImageFeb4202612_27_08PM.png" 
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