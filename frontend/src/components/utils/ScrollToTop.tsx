// src/components/ScrollToTop.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Link 
            to="#" 
            className={`scroll-top d-flex justify-content-center align-items-center ${isVisible ? 'active' : ''}`}
            onClick={(e) => {
                e.preventDefault();
                scrollToTop();
            }}
        >
            <i className="bi bi-arrow-up-short fw-bold"></i>
        </Link>
    );
};

export default ScrollToTop;
