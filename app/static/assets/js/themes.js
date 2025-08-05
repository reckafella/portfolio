// theme-toggler.js
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
            document.body.appendChild(overlay);
        }
        
        // Function to update theme with transition
        function updateTheme(theme, clientX = 0, clientY = 0) {
            // Apply the theme immediately to ensure it's visible during transition
            document.documentElement.setAttribute('data-bs-theme', theme);
            
            // Save preference
            setStoredTheme(theme);
            
            // Position values for the overlay
            const posX = clientX || window.innerWidth / 4; // Biased toward top-left
            const posY = clientY || window.innerHeight / 4; // Biased toward top-left
            
            // Calculate percentage position for the transition origin
            const originX = (posX / window.innerWidth) * 100;
            const originY = (posY / window.innerHeight) * 100;
            
            // Set the opposite theme for the overlay
            const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
            overlay.style.background = oppositeTheme === 'dark' ? '#201f1f' : '#e9e8e6';
            
            // Start with the overlay covering the whole screen
            overlay.style.transition = 'none';
            overlay.style.clipPath = `ellipse(150% 150% at ${originX}% ${originY}%)`;
            
            // Force a reflow to ensure the transition gets applied
            void overlay.offsetWidth;
            
            // Set up the transition
            overlay.style.transition = 'clip-path 1s ease-in-out';
            
            // Animate the overlay away
            overlay.style.clipPath = `ellipse(0% 0% at ${originX}% ${originY}%)`;
            
            // Update icon based on new theme
            themeIcon.classList.remove('bi-sun-fill', 'bi-moon-fill');
            themeIcon.classList.add(theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill');
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
/* // theme-toggler.js
(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', function() {
      // Get elements
      const themeSwitcher = document.getElementById('themeSwitcher');
      const themeIcon = themeSwitcher.querySelector('.theme-icon');
      
      // Theme management functions
      const getStoredTheme = () => localStorage.getItem('theme') || 'dark';
      const setStoredTheme = theme => localStorage.setItem('theme', theme);
      
      // Function to get system preference (if needed)
      const getSystemPreference = () => {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };
      
      // Function to update theme
      function updateTheme(theme) {
          // Set the data-bs-theme attribute on the document root element
          document.documentElement.setAttribute('data-bs-theme', theme);
          
          // Update icon based on current theme
          themeIcon.classList.remove('bi-sun-fill', 'bi-moon-fill');
          themeIcon.classList.add(theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill');
          
          // Save preference
          setStoredTheme(theme);
      }
      
      // Set initial theme
      updateTheme(getStoredTheme());
      
      // Theme switch event listener
      themeSwitcher.addEventListener('click', function() {
          const currentTheme = getStoredTheme();
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          updateTheme(newTheme);
      });
      
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          updateTheme(getSystemPreference());
      });
  });
})();
 */
