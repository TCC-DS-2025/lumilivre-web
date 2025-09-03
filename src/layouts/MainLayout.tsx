import { type ReactNode, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-background">
      <Header isSidebarExpanded={isSidebarExpanded} setSidebarExpanded={setIsSidebarExpanded} />
      <Sidebar isExpanded={isSidebarExpanded} setExpanded={setIsSidebarExpanded} />
      
      <div className={`transition-all duration-300 ease-in-out md:ml-20 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <main className="pt-20 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}