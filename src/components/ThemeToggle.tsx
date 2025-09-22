import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

import Sun from '../assets/icons/sun.svg';
import Moon from '../assets/icons/moon.svg';

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 select-none"
    >
      {theme === 'light' ? <img src={Moon} className='w-6' alt="Icone de Lua" /> : <img src={Sun} className='w-6' alt="Icone de Sol" />}
    </button>
  );
}
