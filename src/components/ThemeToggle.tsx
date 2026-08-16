'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // New users / first-time visitors default strictly to LIGHT mode
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Cambiar tema claro / oscuro"
      title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="p-2 rounded-sm bg-[#F8F9FA] dark:bg-[#2D2D2D] text-[#3C4043] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#383838] hover:border-[#DC2626] material-transition flex items-center justify-center shrink-0"
    >
      {darkMode ? <Sun className="w-4 h-4 text-[#FBBC05]" /> : <Moon className="w-4 h-4 text-[#3C4043]" />}
    </button>
  );
}
