import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

import Sun from '../assets/icons/sun.svg';
import Moon from '../assets/icons/moon.svg';

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => setEffectiveTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const handleToggle = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full shadow-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 select-none"
      title={`Mudar para tema ${effectiveTheme === 'light' ? 'escuro' : 'claro'}`}
    >
      {effectiveTheme === 'light' ? 
        <img src={Moon} className='w-6 h-6' alt="Ativar modo escuro" /> : 
        <img src={Sun} className='w-6 h-6' alt="Ativar modo claro" />
      }
    </button>
  );
}