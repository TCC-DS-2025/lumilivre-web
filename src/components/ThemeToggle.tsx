import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

import SunIcon from '../assets/icons/sun.svg?react';
import MoonIcon from '../assets/icons/moon.svg?react';

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) =>
        setEffectiveTheme(e.matches ? 'dark' : 'light');
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
      className="group p-2 rounded-full shadow-md transition-all duration-200 select-none bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 dark:text-gray-200"
      title={`Mudar para tema ${effectiveTheme === 'light' ? 'escuro' : 'claro'}`}
      aria-label="Alternar tema"
    >
      {effectiveTheme === 'light' ? (
        <MoonIcon
          className="w-6 h-6 text-lumi-primary transition-all duration-500 ease-in-out origin-center overflow-visible group-hover:rotate-180 group-active:scale-180"
        />
      ) : (
        <SunIcon
          className="w-6 h-6 text-white transition-all duration-500 ease-in-out origin-center overflow-visible group-hover:rotate-90 group-active:scale-90"
        />
      )}
    </button>
  );
}
