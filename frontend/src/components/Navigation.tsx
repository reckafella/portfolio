import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Search from './search/Search';
import ThemeSwitch from './utils/SwitchThemes';
import SVGLogoComponent from './Logo';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  onToggleSearch: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSearch }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/services', label: 'Services' },
        { path: '/projects', label: 'Projects' },
        { path: '/blog', label: 'Blog' },
        { path: '/contact', label: 'Contact' },
        { path: '/forms', label: 'Forms Demo' },
    ];

    // Filter auth items based on authentication status
    const getAuthItems = () => {
        if (isAuthenticated) {
            return [
                { path: '/profile', label: `Welcome, ${user?.first_name || user?.username || 'User'}` },
                { path: '/logout', label: 'Logout' }
            ];
        } else {
            return [
                { path: '/login', label: 'Login' },
                { path: '/signup', label: 'Signup' }
            ];
        }
    };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Toggle body class for mobile menu
    document.body.classList.toggle('mobile-nav-active', !isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, [location]);

    return (
        <>
            <header id="header" className="header d-flex align-items-center sticky-top">
                <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
                    <Link to="/" className="logo d-flex align-items-center">
                        <SVGLogoComponent />
                    </Link>
                    <div className='search-nav-wrapper d-flex justify-content-center align-items-center'>
                        <Search onToggleSearch={onToggleSearch} />
                        <ThemeSwitch />
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
                                        {getAuthItems().map((item) => (
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
                        <i className={`mobile-nav-toggle d-xl-none bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'}`}
                            onClick={toggleMobileMenu}></i>
                    </div>
                </div>
            </header>
            <div className="nav-overlay"></div>
        </>
    );
};

export default Navigation;
