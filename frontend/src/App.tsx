import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/home/HomePage'
import ProjectsPage from './pages/projects/ProjectsPage'
import ContactPage from './pages/contact/ContactPage'
import ServicesPage from './pages/services/ServicesPage'
import DynamicFormExample from './pages/DynamicFormExample'
import SearchResults from './pages/search/SearchResults'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ScrollToTop from './components/utils/ScrollToTop'
import SearchOverlay from './components/search/SearchOverlay'
import LoginForm from './components/forms/auth/LoginForm'
import SignupForm from './components/forms/auth/SignupForm'
import LogoutPage from './pages/auth/LogoutPage'
import { SigninRedirect, SignupRedirect, SignoutRedirect } from './components/redirection/AuthRedirect'
import AuthProvider from './hooks/useAuth'
import ErrorBoundary from './components/errors/ErrorBoundary'
import { 
    NotFoundPage, 
    BadRequestPage, 
    UnauthorizedPage, 
    ForbiddenPage, 
    ServerErrorPage 
} from './pages/errors'
import './App.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 6, // 6 minutes
        },
    }
});

function App() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
    };

    return (
        <ErrorBoundary>
            <Router>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <div className="d-flex flex-column min-vh-100">
                            <Navigation onToggleSearch={toggleSearch} />
                            <main className="flex-grow-1">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/projects" element={<ProjectsPage />} />
                                    <Route path="/contact" element={<ContactPage />} />
                                    <Route path="/services" element={<ServicesPage />} />
                                    <Route path="/forms" element={<DynamicFormExample />} />
                                    <Route path="/search" element={<SearchResults />} />

                                    {/* Authentication routes */}
                                    <Route path="/signin" element={<SigninRedirect />} />
                                    <Route path="/login" element={<LoginForm />} />
                                    <Route path="/register" element={<SignupRedirect />} />
                                    <Route path="/signup" element={<SignupForm />} />
                                    <Route path="/signout" element={<SignoutRedirect />} />
                                    <Route path="/logout" element={<LogoutPage />} />

                                    {/* Error routes */}
                                    <Route path="/error/400" element={<BadRequestPage />} />
                                    <Route path="/error/401" element={<UnauthorizedPage />} />
                                    <Route path="/error/403" element={<ForbiddenPage />} />
                                    <Route path="/error/404" element={<NotFoundPage />} />
                                    <Route path="/error/500" element={<ServerErrorPage />} />

                                    {/* Catch-all route for 404 */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </main>
                            <Footer />
                            <ScrollToTop />
                            <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
                        </div>
                    </AuthProvider>
                </QueryClientProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App;
