import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
    { path: '/forms', label: 'Forms Demo' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

    return (
        <header id="header" className="header d-flex align-items-center sticky-top">
            <div className="container-fluid d-flex justify-content-around align-items-center">
                <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
                    <img className="sitename" alt="Ethan"
                        src="https://res.cloudinary.com/dg4sl9jhw/image/upload/portfolio-logo" />
                </Link>
                <div className="search-nav-wrapper d-flex justify-content-between align-items-center gap-1">
                    <div className="d-block search-icon">
                        <Link to="/search" className="search-bar-toggle">
                            <i className="bi bi-search"></i>
                        </Link>
                    </div>
                    <button type="button" className="btn p-0 m-0 theme-switcher" id="themeSwitcher">
                        <i className="bi bi-sun-fill theme-icon"></i>
                    </button>
                    <nav id="navmenu" className="navmenu">
                        <ul>
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={location.pathname === item.path ? 'active' : ''}
                                    >
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <i
                        className={`mobile-nav-toggle d-lg-none bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'}`}
                        onClick={toggleMobileMenu}
                    ></i>
                </div>
            </div>
        </header>
    );
};

export default Navigation;
