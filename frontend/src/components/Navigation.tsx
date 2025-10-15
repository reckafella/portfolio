import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Search from './search/Search';
import ThemeSwitch from './utils/SwitchThemes';
import SVGLogoComponent from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { getLoginUrlWithNext, getSignupUrlWithNext } from '@/utils/authUtils';
import { NAV_ITEMS, ROUTES } from '@/constants/routes';

interface NavigationProps {
  onToggleSearch: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSearch }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
    const { isStaff, canCreateProjects } = useStaffPermissions();
    const [isToggleDropdownOpen, setIsToggleDropdownOpen] = useState(false);
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

    const navItems = NAV_ITEMS;

    // Filter auth items based on authentication status
    const getAuthItems = () => {
        if (isAuthenticated) {
            return [
                { path: ROUTES.AUTH.PROFILE, label: `Welcome, ${user?.first_name || user?.username || 'User'}` },
                { path: ROUTES.AUTH.LOGOUT, label: 'Logout' }
            ];
        } else {
            // Include current page as next parameter for login/signup
            const currentPath = location.pathname + location.search;
            return [
                { path: getLoginUrlWithNext(currentPath), label: 'Login' },
                { path: getSignupUrlWithNext(currentPath), label: 'Signup' }
            ];
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Toggle body class for mobile menu
        document.body.classList.toggle('mobile-nav-active', !isMobileMenuOpen);
    };

    const toggleAccountDropdown = () => {
        setIsToggleDropdownOpen(!isToggleDropdownOpen);
    };

    const toggleStaffDropdown = () => {
        setIsStaffDropdownOpen(!isStaffDropdownOpen);
    };


    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsToggleDropdownOpen(false);
        setIsStaffDropdownOpen(false);
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

                                {/* Staff-only dropdown */}
                                {isStaff && (
                                    <li className={`dropdown ${isStaffDropdownOpen ? 'dropdown-active' : ''}`}>
                                        <a
                                            role="button"
                                            className="toggle-dropdown"
                                            onClick={toggleStaffDropdown}
                                            aria-expanded={isStaffDropdownOpen}
                                        >
                                            <span>Staff Tools</span>
                                            <i className={`bi ${isStaffDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} toggle-dropdown`}></i>
                                        </a>
                                        <ul className={isStaffDropdownOpen ? 'dropdown-active' : ''}>
                                            {canCreateProjects && (
                                                <li>
                                                    <Link to={ROUTES.PROJECTS.ADD}>
                                                        <span>Add Project</span>
                                                    </Link>
                                                </li>
                                            )}
                                            <li>
                                                <Link to="/admin">
                                                    <span>Admin Panel</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>
                                )}


                                <li className={`dropdown ${isToggleDropdownOpen ? 'active' : ''}`}>
                                    <a role="button"
                                        className="toggle-dropdown"
                                        onClick={toggleAccountDropdown}
                                        aria-expanded={isToggleDropdownOpen}
                                    >
                                        <span>Account</span>
                                        <i className={`bi ${isToggleDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                    </a>
                                    <ul className={isToggleDropdownOpen ? 'dropdown-active' : ''}>
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
                        <i className={`mobile-nav-toggle d-lg-none bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'}`}
                            onClick={toggleMobileMenu}></i>
                    </div>
                </div>
            </header>
            <div className="nav-overlay"></div>
        </>
    );
};

export default Navigation;
