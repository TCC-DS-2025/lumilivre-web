// src/layouts/MainLayout.tsx
import { type ReactNode, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-dark-background overflow-hidden transition-colors duration-200">
      <Header isSidebarExpanded={isSidebarExpanded} setSidebarExpanded={setIsSidebarExpanded} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isExpanded={isSidebarExpanded} setExpanded={setIsSidebarExpanded} />
        
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out md:ml-20 ${isSidebarExpanded ? 'md:ml-52' : 'md:ml-24'}`}>
          <main className="pt-20 p-4 sm:p-6 lg:p-8 h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}