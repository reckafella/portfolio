// Enhanced theme-toggler.js with dramatic page-turning animation
(() => {
    'use strict'
  
    document.addEventListener('DOMContentLoaded', function() {
        // Get elements
        const themeSwitcher = document.getElementById('themeSwitcher');
        const themeIcon = themeSwitcher.querySelector('.theme-icon');
        
        // Theme management functions
        const getStoredTheme = () => localStorage.getItem('theme') || 'dark';
        const setStoredTheme = theme => localStorage.setItem('theme', theme);
        
        // Create and append transition overlay element if it doesn't exist
        let overlay = document.getElementById('theme-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
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
        }
        
        // Function to update theme with dramatic page-turning transition
        function updateTheme(theme, clickX = 0, clickY = 0) {
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
            document.documentElement.setAttribute('data-bs-theme', theme);
            setStoredTheme(theme);
            
            // Create dramatic page-turning animation from top-left to bottom-right
            overlay.style.transition = 'clip-path 1.2s cubic-bezier(0.23, 1, 0.32, 1)';
            
            // Animate the page being "turned" diagonally from top-left corner
            setTimeout(() => {
                overlay.style.clipPath = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
            }, 50);
            
            // Update icon during the animation for better visual feedback
            setTimeout(() => {
                themeIcon.classList.remove('bi-sun-fill', 'bi-moon-fill');
                themeIcon.classList.add(theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill');
            }, 300);
            
            // Clean up after animation completes
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '0';
                overlay.style.transition = 'none';
                overlay.style.clipPath = 'none';
            }, 1400);
        }
        
        // Set initial theme (without transition)
        const initialTheme = getStoredTheme();
        document.documentElement.setAttribute('data-bs-theme', initialTheme);
        themeIcon.classList.remove('bi-sun-fill', 'bi-moon-fill');
        themeIcon.classList.add(initialTheme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill');
        
        // Theme switch event listener
        themeSwitcher.addEventListener('click', function(e) {
            const currentTheme = getStoredTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            updateTheme(newTheme, e.clientX, e.clientY);
        });
    });
})();
