import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Search from './search/Search';
import ThemeSwitch from './utils/SwitchThemes';
import SVGLogoComponent from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { getLoginUrlWithNext, getSignupUrlWithNext } from '@/utils/authUtils';
import { NAV_ITEMS, ROUTES, ADMIN_NAV_ITEMS } from '@/constants/routes';

interface NavigationProps {
  onToggleSearch: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSearch }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
    const { isStaff, canCreateProjects, canCreateBlog } = useStaffPermissions();
    const [isToggleDropdownOpen, setIsToggleDropdownOpen] = useState(false);
    const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false);
    const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);

    const navItems = NAV_ITEMS;
    const adminNavItems = ADMIN_NAV_ITEMS;

    // Filter auth items based on authentication status
    const getAuthItems = () => {
        if (isAuthenticated) {
            return [
                { path: ROUTES.AUTH.PROFILE, label: `Welcome, ${user?.first_name || user?.username || 'User'}` },
                ...adminNavItems,
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

    const toggleBlogDropdown = () => {
        setIsBlogDropdownOpen(!isBlogDropdownOpen);
    };

    const toggleProjectsDropdown = () => {
        setIsProjectsDropdownOpen(!isProjectsDropdownOpen);
    };


    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsToggleDropdownOpen(false);
        setIsBlogDropdownOpen(false);
        setIsProjectsDropdownOpen(false);
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
                                {navItems.map((item) => {
                                    // Handle Blog dropdown for staff users
                                    if (item.path === ROUTES.BLOG.LIST && isStaff && canCreateBlog) {
                                        return (
                                            <li key={item.path} className={`dropdown ${isBlogDropdownOpen ? 'dropdown-active' : ''}`}>
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={toggleBlogDropdown}
                                                    aria-expanded={isBlogDropdownOpen}
                                                >
                                                    <span>{item.label}</span>
                                                    <i className={`bi ${isBlogDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} toggle-dropdown`}></i>
                                                </a>
                                                <ul className={isBlogDropdownOpen ? 'dropdown-active' : ''}>
                                                    <li>
                                                        <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                                                            <span>View All Posts</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.BLOG.ADD}>
                                                            <span>Add Blog Post</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }
                                    
                                    // Handle Projects dropdown for staff users
                                    if (item.path === ROUTES.PROJECTS.LIST && isStaff && canCreateProjects) {
                                        return (
                                            <li key={item.path} className={`dropdown ${isProjectsDropdownOpen ? 'dropdown-active' : ''}`}>
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={toggleProjectsDropdown}
                                                    aria-expanded={isProjectsDropdownOpen}
                                                >
                                                    <span>{item.label}</span>
                                                    <i className={`bi ${isProjectsDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} toggle-dropdown`}></i>
                                                </a>
                                                <ul className={isProjectsDropdownOpen ? 'dropdown-active' : ''}>
                                                    <li>
                                                        <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                                                            <span>View All Projects</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.PROJECTS.ADD}>
                                                            <span>Add Project</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }
                                    
                                    // Regular nav items
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={location.pathname === item.path ? 'active' : ''}
                                            >
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

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
