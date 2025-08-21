import React, { useEffect } from 'react';
import HeroSection from './Hero';
import AboutSection from './About';
import SkillsSection from './Skills';
import ServicesSection from '../services/Services';


// Add TypeScript declarations for global variables
declare global {
  interface Window {
    AOS: any;
    Typed: any;
  }
}

const HomePage: React.FC = () => {
useEffect(() => {
    let typedInstance: any = null;

    // Initialize AOS (Animate On Scroll)
    if (window.AOS) {
        window.AOS.init();
    }

    // Initialize Typed.js for typing animation
    if (window.Typed) {
        const typedElement = document.querySelector('.typed');
        if (typedElement) {
            let typed_strings = typedElement.getAttribute('data-typed-items')?.split(',');
            typedInstance = new window.Typed(`.typed`, {
                strings: typed_strings,
                loop: true,
                typeSpeed: 100,
                backSpeed: 50,
                backDelay: 2000
            });
        }
    }

    // Cleanup function to destroy the Typed instance
    return () => {
        if (typedInstance) {
            typedInstance.destroy();
        }
    };
}, []); // Empty dependency array ensures this runs only once

  return (
      <>
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ServicesSection />
      </>
  );
};

export default HomePage;
