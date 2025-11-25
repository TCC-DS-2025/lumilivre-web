import { type ReactNode, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { getRouteIndex } from '../utils/navigationOrder';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const { isLoggingOut } = useAuth();

  const location = useLocation();

  const prevIdxRef = useRef(getRouteIndex(location.pathname));
  const directionRef = useRef(0);

  const currentIdx = getRouteIndex(location.pathname);

  if (currentIdx !== prevIdxRef.current) {
    if (currentIdx > prevIdxRef.current) {
      directionRef.current = 1;
    } else if (currentIdx < prevIdxRef.current) {
      directionRef.current = -1;
    }
    prevIdxRef.current = currentIdx;
  }

  const contentSpacingClass = isSidebarPinned
    ? isSidebarExpanded
      ? 'md:ml-48'
      : 'md:ml-20'
    : 'ml-20';

  const variants: Variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '10%' : '-10%',
      opacity: 0,
      zIndex: 1,
      willChange: 'transform, opacity',
    }),
    center: {
      y: '0%',
      opacity: 1,
      zIndex: 1,
      transition: {
        duration: 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-10%' : '10%',
      opacity: 0,
      zIndex: 0,
      willChange: 'transform, opacity',
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <div
      className={`
        h-screen flex flex-col bg-gray-100 dark:bg-dark-background overflow-hidden
        ${isLoggingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      <Header
        isSidebarExpanded={isSidebarExpanded}
        setSidebarExpanded={setIsSidebarExpanded}
        isSidebarPinned={isSidebarPinned}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isExpanded={isSidebarExpanded}
          setExpanded={setIsSidebarExpanded}
          isPinned={isSidebarPinned}
          setPinned={setIsSidebarPinned}
        />

        <div
          className={`flex-1 relative h-full overflow-hidden ${contentSpacingClass}`}
        >
          <AnimatePresence
            mode="popLayout"
            custom={directionRef.current}
            initial={false}
          >
            <motion.main
              key={location.pathname}
              custom={directionRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full p-6 sm:p-6 lg:p-8 overflow-y-auto scroll-smooth custom-scrollbar bg-gray-100 dark:bg-dark-background will-change-transform"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
