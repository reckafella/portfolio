import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/services', label: 'Services' },
        { path: '/projects', label: 'Projects' },
        { path: '/blog', label: 'Blog' },
        { path: '/contact', label: 'Contact' },
        { path: '/forms', label: 'Forms Demo' },
    ];

    const authPaths = [
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' },
        { path: '/logout', label: 'Logout' }
    ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Toggle body class for mobile menu
    document.body.classList.toggle('mobile-nav-active', !isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, [location]);

    return (
        <>
            <header id="header" className="header d-flex align-items-center sticky-top">
                <div className="container-fluid d-flex justify-content-around align-items-center">
                    <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
                        <img src="https://res.cloudinary.com/dg4sl9jhw/image/upload/portfolio-logo" 
                             alt="Ethan" 
                             className="logo-img image-fluid" 
                             loading="lazy" />
                    </Link>
                    <div className="search-nav-wrapper d-flex justify-content-between align-items-center gap-1">
                        <div className="d-block search-icon">
                            <button 
                                type="button" 
                                role="button" 
                                className="search-bar-toggle"
                                onClick={toggleSearch}
                            >
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                        <button type="button" className="btn bg-transparent border-0 p-0 m-0 theme-switcher" id="themeSwitcher">
                            <i className="bi bi-sun-fill theme-icon"></i>
                        </button>
                        <nav id="navmenu" className="navmenu">
                            <ul>
                                {navItems.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={location.pathname === item.path ? 'active' : ''}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                                <li className="dropdown">
                                    <a role="button" className="">
                                        <span>Account</span>
                                        <i className="bi bi-chevron-down toggle-dropdown"></i>
                                    </a>
                                    <ul>
                                        {authPaths.map((item) => (
                                            <li key={item.path}>
                                                <Link to={item.path}>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                        <i
                            className={`mobile-nav-toggle d-xl-none bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'}`}
                            onClick={toggleMobileMenu}
                        ></i>
                    </div>
                </div>
            </header>
            <div className="nav-overlay"></div>
            
            <div id="full-page-search" className={isSearchOpen ? 'search-active' : ''}>
                <button type="button" className="close" onClick={closeSearch}>
                    <i className="bi bi-x-lg"></i>
                </button>
                <div className="search-container">
                    <div className="search-header">
                        <h2>Search</h2>
                    </div>
                    <form action="/search" className="d-flex flex-column align-items-center gap-3 gap-lg-5 w-100">
                        <input 
                            type="search" 
                            name="q" 
                            id="search-input" 
                            className="typed-search"
                            placeholder="Search projects, blog posts..." 
                            required 
                            autoFocus={isSearchOpen}
                        />
                        <button type="submit" className="btn btn-success fw-bold">Search</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Navigation;
