import React from 'react';
import HeroSection from './Hero';
import AboutSection from './About';
import SkillsSection from './Skills';
import ServicesSection from '@/pages/services/Services';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaTags } from '@/hooks/useMetaTags';

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
        ogImage: '/static/assets/images/og-default.jpeg',
        twitterTitle: 'Ethan Wanyoike - Software Engineer Portfolio',
        twitterDescription: 'Welcome to my portfolio! I am Ethan Wanyoike, a Software Engineer specializing in DevOps Engineering, Backend Development, Frontend Development, and Technical Writing.',
        twitterImage: '/static/assets/images/og-default.jpeg',
        canonical: window.location.origin
    });

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
