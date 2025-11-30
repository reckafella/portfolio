import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Search from "./search/Search";
import ThemeSwitch from "./utils/SwitchThemes";
import SVGComponent from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { getLoginUrlWithNext, getSignupUrlWithNext } from "@/utils/authUtils";
import { NAV_ITEMS, ROUTES, ADMIN_NAV_ITEMS } from "@/constants/routes";

interface NavigationProps {
    onToggleSearch: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSearch }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
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
                { path: ROUTES.AUTH.PROFILE, icon: "bi-person-gear", label: "My Profile" },
                { path: "/goals", icon: "bi-bullseye", label: "My Goals" },
                ...adminNavItems,
                { path: ROUTES.AUTH.LOGOUT, icon: "bi-box-arrow-left", label: "Logout" },
            ];
        } else {
            // Include current page as next parameter for login/signup
            const currentPath = location.pathname + location.search;
            return [
                { path: getLoginUrlWithNext(currentPath), icon: "bi-box-arrow-right", label: "Login" },
                { path: getSignupUrlWithNext(currentPath), icon: "bi-box-arrow-right", label: "Signup" },
            ];
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Toggle body class for mobile menu
        document.body.classList.toggle("mobile-nav-active", !isMobileMenuOpen);
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
        document.body.classList.remove("mobile-nav-active");
    }, [location]);

    return (
        <>
            <header
                id="header"
                className="header d-flex align-items-center sticky-top"
            >
                <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
                    <Link
                        to="/"
                        className="logo d-flex justify-content-start align-items-center"
                    >
                        <SVGComponent />
                    </Link>
                    <div className="search-nav-wrapper d-flex justify-content-center align-items-center gap-0">
                        <Search onToggleSearch={onToggleSearch} />
                        <ThemeSwitch />
                        <nav id="navmenu" className="navmenu">
                            <ul>
                                {navItems.map((item, index) => {
                                    // Determine priority: first 2 items are high priority for medium screens
                                    const priority = index < 2 ? "high" : "low";

                                    // Handle Blog dropdown for staff users
                                    if (
                                        item.path === ROUTES.BLOG.LIST &&
                                        isStaff &&
                                        canCreateBlog
                                    ) {
                                        return (
                                            <li
                                                key={item.path}
                                                data-priority={priority}
                                                className={`dropdown ${isBlogDropdownOpen ? "dropdown-active" : ""}`}
                                            >
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={toggleBlogDropdown}
                                                    aria-expanded={
                                                        isBlogDropdownOpen
                                                    }
                                                >
                                                    <span>{item.label}</span>
                                                    <i
                                                        className={`bi ${isBlogDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} toggle-dropdown`}
                                                    ></i>
                                                </a>
                                                <ul
                                                    className={
                                                        isBlogDropdownOpen
                                                            ? "dropdown-active"
                                                            : ""
                                                    }
                                                >
                                                    <li>
                                                        <Link to={item.path}
                                                            className={location.pathname === item.path ? "active" : ""}
                                                        >
                                                            <i className="bi bi-list"></i>
                                                            <span>View Articles</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.BLOG.ADD}
                                                            className={location.pathname === ROUTES.BLOG.ADD ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-plus-square`}></i>
                                                            <span>Add Article</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }

                                    // Handle Projects dropdown for staff users
                                    if (
                                        item.path === ROUTES.PROJECTS.LIST &&
                                        isStaff &&
                                        canCreateProjects
                                    ) {
                                        return (
                                            <li
                                                key={item.path}
                                                data-priority={priority}
                                                className={`dropdown ${isProjectsDropdownOpen ? "dropdown-active" : ""}`}
                                            >
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={
                                                        toggleProjectsDropdown
                                                    }
                                                    aria-expanded={
                                                        isProjectsDropdownOpen
                                                    }
                                                >
                                                    <span>{item.label}</span>
                                                    <i
                                                        className={`bi ${isProjectsDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} toggle-dropdown`}
                                                    ></i>
                                                </a>
                                                <ul
                                                    className={
                                                        isProjectsDropdownOpen
                                                            ? "dropdown-active"
                                                            : ""
                                                    }
                                                >
                                                    <li>
                                                        <Link
                                                            to={item.path}
                                                            className={location.pathname === item.path ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-list`}></i>
                                                            <span>View Projects</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.PROJECTS.ADD}
                                                            className={location.pathname === ROUTES.PROJECTS.ADD ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-plus-square`}></i>
                                                            <span>Add Project</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }

                                    // Regular nav items
                                    return (
                                        <li key={item.path} data-priority={priority}>
                                            <Link
                                                to={item.path}
                                                className={
                                                    location.pathname ===
                                                        item.path
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

                                <li
                                    data-priority="low"
                                    className={`dropdown ${isToggleDropdownOpen ? "active" : ""}`}
                                >
                                    <a
                                        role="button"
                                        className="toggle-dropdown"
                                        onClick={toggleAccountDropdown}
                                        aria-expanded={isToggleDropdownOpen}
                                    >
                                        <span>Account</span>
                                        <i
                                            className={`bi ${isToggleDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
                                        ></i>
                                    </a>
                                    <ul
                                        className={
                                            isToggleDropdownOpen
                                                ? "dropdown-active"
                                                : ""
                                        }
                                    >
                                        {/* Staff-only inbox link */}
                                        {isStaff && (
                                            <li>
                                                <Link
                                                    to={ROUTES.MESSAGES.INBOX}
                                                    className="d-flex align-items-center justify-content-start gap-1"
                                                >
                                                    <i className="bi bi-inbox"></i>
                                                    <span>Inbox</span>
                                                </Link>
                                            </li>
                                        )}
                                        {getAuthItems().map((item) => (
                                            <li key={item.path}>
                                                <Link to={item.path} className="d-flex align-items-center justify-content-start gap-1">
                                                    <i className={`bi ${item.icon}`}></i>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                        {/* Mobile menu container for medium screens (shows low-priority items) */}
                        <div className="navmenu-mobile-container">
                            <ul>
                                {navItems.map((item, index) => {
                                    const priority = index < 2 ? "high" : "low";

                                    // Only show low-priority items in mobile container
                                    if (priority === "high") return null;

                                    // Handle Blog dropdown for staff users
                                    if (
                                        item.path === ROUTES.BLOG.LIST &&
                                        isStaff &&
                                        canCreateBlog
                                    ) {
                                        return (
                                            <li
                                                key={item.path}
                                                data-priority={priority}
                                                className={`dropdown ${isBlogDropdownOpen ? "dropdown-active" : ""}`}
                                            >
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={toggleBlogDropdown}
                                                    aria-expanded={isBlogDropdownOpen}
                                                >
                                                    <span>{item.label}</span>
                                                    <i
                                                        className={`bi ${isBlogDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} toggle-dropdown`}
                                                    ></i>
                                                </a>
                                                <ul
                                                    className={
                                                        isBlogDropdownOpen
                                                            ? "dropdown-active"
                                                            : ""
                                                    }
                                                >
                                                    <li>
                                                        <Link to={item.path}
                                                            className={location.pathname === item.path ? "active" : ""}
                                                        >
                                                            <i className="bi bi-list"></i>
                                                            <span>View Articles</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.BLOG.ADD}
                                                            className={location.pathname === ROUTES.BLOG.ADD ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-plus-square`}></i>
                                                            <span>Add Article</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }

                                    // Handle Projects dropdown for staff users
                                    if (
                                        item.path === ROUTES.PROJECTS.LIST &&
                                        isStaff &&
                                        canCreateProjects
                                    ) {
                                        return (
                                            <li
                                                key={item.path}
                                                data-priority={priority}
                                                className={`dropdown ${isProjectsDropdownOpen ? "dropdown-active" : ""}`}
                                            >
                                                <a
                                                    role="button"
                                                    className="toggle-dropdown"
                                                    onClick={toggleProjectsDropdown}
                                                    aria-expanded={isProjectsDropdownOpen}
                                                >
                                                    <span>{item.label}</span>
                                                    <i
                                                        className={`bi ${isProjectsDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} toggle-dropdown`}
                                                    ></i>
                                                </a>
                                                <ul
                                                    className={
                                                        isProjectsDropdownOpen
                                                            ? "dropdown-active"
                                                            : ""
                                                    }
                                                >
                                                    <li>
                                                        <Link
                                                            to={item.path}
                                                            className={location.pathname === item.path ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-list`}></i>
                                                            <span>View Projects</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={ROUTES.PROJECTS.ADD}
                                                            className={location.pathname === ROUTES.PROJECTS.ADD ? "active" : ""}
                                                        >
                                                            <i className={`bi bi-plus-square`}></i>
                                                            <span>Add Project</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                        );
                                    }

                                    // Regular nav items
                                    return (
                                        <li key={item.path} data-priority={priority}>
                                            <Link
                                                to={item.path}
                                                className={
                                                    location.pathname === item.path
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

                                <li
                                    data-priority="low"
                                    className={`dropdown ${isToggleDropdownOpen ? "active" : ""}`}
                                >
                                    <a
                                        role="button"
                                        className="toggle-dropdown"
                                        onClick={toggleAccountDropdown}
                                        aria-expanded={isToggleDropdownOpen}
                                    >
                                        <span>Account</span>
                                        <i
                                            className={`bi ${isToggleDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
                                        ></i>
                                    </a>
                                    <ul
                                        className={
                                            isToggleDropdownOpen
                                                ? "dropdown-active"
                                                : ""
                                        }
                                    >
                                        {/* Staff-only inbox link */}
                                        {isStaff && (
                                            <li>
                                                <Link
                                                    to={ROUTES.MESSAGES.INBOX}
                                                    className="d-flex align-items-center justify-content-start gap-1"
                                                >
                                                    <i className="bi bi-inbox"></i>
                                                    <span>Inbox</span>
                                                </Link>
                                            </li>
                                        )}
                                        {getAuthItems().map((item) => (
                                            <li key={item.path}>
                                                <Link to={item.path} className="d-flex align-items-center justify-content-start gap-1">
                                                    <i className={`bi ${item.icon}`}></i>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <i
                            className={`mobile-nav-toggle d-xl-none bi ${isMobileMenuOpen ? "bi-x-lg" : "bi-list"}`}
                            onClick={toggleMobileMenu}
                        ></i>
                    </div>
                </div>
            </header>
            <div className="nav-overlay"></div>
        </>
    );
};

export default Navigation;
