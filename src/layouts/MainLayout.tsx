import { type ReactNode, useState } from 'react';

import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const contentSpacingClass = isSidebarPinned
    ? isSidebarExpanded
      ? 'md:ml-48'
      : 'md:ml-24'
    : 'pl-20';

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-dark-background overflow-hidden">
      <Header
        isSidebarExpanded={isSidebarExpanded}
        setSidebarExpanded={setIsSidebarExpanded}
        isSidebarPinned={isSidebarPinned}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isExpanded={isSidebarExpanded}
          setExpanded={setIsSidebarExpanded}
          isPinned={isSidebarPinned}
          setPinned={setIsSidebarPinned}
        />

        <div
          className={`flex-1 overflow-y-auto duration-300 ${contentSpacingClass}`}
        >
          <main className="p-6 sm:p-6 lg:p-8 h-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
