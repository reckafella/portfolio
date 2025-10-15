import React, { useState, useEffect, useRef } from 'react';
import { tabSyncService, TabSyncMessage } from '@/services/tabSyncService';

interface ThemeSwitchProps {
  className?: string;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className = "" }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Create transition overlay element if it doesn't exist
    if (!overlayRef.current) {
      const overlay = document.createElement('div');
      overlay.id = 'theme-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        display: none;
        opacity: 0;
        transition: none;
      `;
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    }
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      applyThemeImmediate(savedTheme === 'dark');
    } else {
      setIsDarkMode(systemDarkMode);
      applyThemeImmediate(systemDarkMode);
    }
  }, []);

  // Apply theme immediately (without animation)
  const applyThemeImmediate = (darkMode: boolean) => {
    const html = document.documentElement;
    const body = document.body;
    
    html.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    
    if (darkMode) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  };

  // Apply theme with dramatic page-turning animation
  const updateThemeWithAnimation = (theme: 'light' | 'dark', _clickX = 0, _clickY = 0, broadcast = true) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Set the opposite theme color for the overlay (what we're transitioning from)
    const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
    const overlayColor = oppositeTheme === 'dark' ? '#212529' : '#f8f9fa';

    // Show overlay with current theme's background
    overlay.style.transition = 'none';
    overlay.style.background = overlayColor;
    overlay.style.display = 'block';
    overlay.style.opacity = '1';

    // Start with full coverage - like a page completely covering the screen
    overlay.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

    // Force reflow to ensure styles are applied
    overlay.offsetHeight;

    // Apply the new theme (it will be revealed as the page "turns")
    const html = document.documentElement;
    const body = document.body;
    
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }

    // Broadcast theme change to other tabs (only if initiated by user)
    if (broadcast) {
      tabSyncService.broadcastThemeChange(theme);
    }

    // Create dramatic page-turning animation based on theme direction
    overlay.style.transition = 'clip-path 1.2s cubic-bezier(0.23, 1, 0.32, 1)';

    // Animate the page being "turned" based on theme change direction
    setTimeout(() => {
      if (theme === 'light') {
        // Dark to Light: Turn page from right to left (backward)
        overlay.style.clipPath = 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)';
      } else {
        // Light to Dark: Turn page from left to right (forward)
        overlay.style.clipPath = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
      }
    }, 50);

    // Update React state during the animation for better visual feedback
    setTimeout(() => {
      setIsDarkMode(theme === 'dark');
    }, 300);

    // Clean up after animation completes
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      overlay.style.transition = 'none';
      overlay.style.clipPath = 'none';
      
      // Dispatch custom event for other components that might need to listen
      window.dispatchEvent(new CustomEvent('themeChange', { 
        detail: { isDarkMode: theme === 'dark' } 
      }));
    }, 1400);
  };

  // Toggle theme with animation
  const toggleTheme = (e: React.MouseEvent) => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateThemeWithAnimation(newTheme, e.clientX, e.clientY);
  };

  // Listen for theme changes from other tabs
  useEffect(() => {
    const handleTabSyncMessage = (message: TabSyncMessage) => {
      if (message.type === 'THEME_CHANGE' && message.payload.theme) {
        const newTheme = message.payload.theme;
        // Apply theme without broadcasting (to avoid infinite loop)
        // Also apply without animation to sync immediately
        setIsDarkMode(newTheme === 'dark');
        applyThemeImmediate(newTheme === 'dark');
      }
    };

    // Register the listener
    tabSyncService.addListener(handleTabSyncMessage);

    // Cleanup on unmount
    return () => {
      tabSyncService.removeListener(handleTabSyncMessage);
    };
  }, []);

  // Cleanup overlay on component unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
      }
    };
  }, []);

  return (
    <button 
      type="button" 
      className={`btn bg-transparent border-0 p-0 m-0 theme-switcher ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      id="themeSwitcher"
    >
      <i className={`bi ${isDarkMode ? 'bi-moon-fill' : 'bi-sun-fill'} theme-icon`}></i>
    </button>
  );
};

export default ThemeSwitch;
