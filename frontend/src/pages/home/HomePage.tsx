import React, { useEffect } from 'react';
import HeroSection from './Hero';
import AboutSection from './About';
import SkillsSection from './Skills';
import ServicesSection from '@/pages/services/Services';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaTags } from '@/hooks/useMetaTags';


// Add TypeScript declarations for global variables
declare global {
  interface Window {
    AOS: any;
    Typed: any;
  }
}

const HomePage: React.FC = () => {
    usePageTitle('Home');
    
    useMetaTags({
        title: 'Home',
        description: 'Welcome to my portfolio! I am Ethan Wanyoike, a Software Engineer specializing in DevOps Engineering, Backend Development, Frontend Development, and Technical Writing. Explore my projects, blog, and more.',
        keywords: 'portfolio, software engineer, web development, projects, blog, contact, Ethan Wanyoike, DevOps, backend development, frontend development',
        ogTitle: 'Ethan Wanyoike - Software Engineer Portfolio',
        ogDescription: 'Welcome to my portfolio! I am Ethan Wanyoike, a Software Engineer specializing in DevOps Engineering, Backend Development, Frontend Development, and Technical Writing.',
        ogType: 'website',
        ogUrl: window.location.origin,
        ogImage: '/og-image.png',
        twitterTitle: 'Ethan Wanyoike - Software Engineer Portfolio',
        twitterDescription: 'Welcome to my portfolio! I am Ethan Wanyoike, a Software Engineer specializing in DevOps Engineering, Backend Development, Frontend Development, and Technical Writing.',
        twitterImage: '/og-image.png',
        canonical: window.location.origin
    });
    
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
