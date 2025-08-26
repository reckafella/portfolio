import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import HomePage from './pages/home/HomePage'
import { ProjectListPage } from './pages/projects/ProjectListPage'
import { ProjectAddPage } from './pages/projects/ProjectAddPage'
import { ProjectEditPage } from './pages/projects/ProjectEditPage'
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage'
import { BlogListPage, BlogDetailPage, BlogAddPage, BlogEditPage } from './pages/blog'
import ContactPage from './pages/contact/ContactPage'
import ServicesPage from './pages/services/ServicesPage'
import SearchResults from './pages/search/SearchResults'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ScrollToTop from './components/utils/ScrollToTop'
import SearchOverlay from './components/search/SearchOverlay'
import LoginForm from './components/forms/auth/LoginForm'
import SignupForm from './components/forms/auth/SignupForm'
import LogoutPage from './pages/auth/LogoutPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import AuthProvider from './hooks/useAuth'
import ErrorBoundary from './components/errors/ErrorBoundary'
import { LoadingProvider } from './hooks/useLoading'
import Preloader from './components/common/Preloader'
import RouteTransition from './components/transitions/RouteTransition'
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
                    <LoadingProvider>
                        <AuthProvider>
                            <Preloader showInitial={true} />
                            <div className="d-flex flex-column min-vh-100">
                                <Navigation onToggleSearch={toggleSearch} />
                                <main className="flex-grow-1">
                                    <RouteTransition>
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            
                                            {/* Project routes */}
                                            <Route path="/projects" element={<ProjectListPage />} />
                                            <Route 
                                                path="/projects/new" 
                                                element={
                                                    <ProtectedRoute requireStaff={true}>
                                                        <ProjectAddPage />
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/projects/edit/:slug" 
                                                element={
                                                    <ProtectedRoute requireStaff={true}>
                                                        <ProjectEditPage />
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                                            
                                            {/* Blog routes */}
                                            <Route path="/blog" element={<BlogListPage />} />
                                            <Route 
                                                path="/blog/new" 
                                                element={
                                                    <ProtectedRoute requireStaff={true}>
                                                        <BlogAddPage />
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/blog/edit/:slug" 
                                                element={
                                                    <ProtectedRoute requireStaff={true}>
                                                        <BlogEditPage />
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route path="/blog/:slug" element={<BlogDetailPage />} />
                                            
                                            <Route path="/contact" element={<ContactPage />} />
                                            <Route path="/services" element={<ServicesPage />} />
                                            <Route path="/search" element={<SearchResults />} />

                                            {/* Authentication routes - organized under /auth for consistency */}
                                            <Route path="/login" element={<LoginForm />} />
                                            <Route path="/signup" element={<SignupForm />} />
                                            <Route path="/logout" element={<LogoutPage />} />
                                            
                                            {/* Legacy authentication route redirects for backward compatibility */}
                                            <Route path="/login" element={<Navigate to="/login" replace />} />
                                            <Route path="/signin" element={<Navigate to="/login" replace />} />
                                            <Route path="/signup" element={<Navigate to="/signup" replace />} />
                                            <Route path="/register" element={<Navigate to="/signup" replace />} />
                                            <Route path="/logout" element={<Navigate to="/logout" replace />} />
                                            <Route path="/signout" element={<Navigate to="/logout" replace />} />

                                            {/* Error routes */}
                                            <Route path="/error/400" element={<BadRequestPage />} />
                                            <Route path="/error/401" element={<UnauthorizedPage />} />
                                            <Route path="/error/403" element={<ForbiddenPage />} />
                                            <Route path="/error/404" element={<NotFoundPage />} />
                                            <Route path="/error/500" element={<ServerErrorPage />} />

                                            {/* Catch-all route for 404 */}
                                            <Route path="*" element={<NotFoundPage />} />
                                        </Routes>
                                    </RouteTransition>
                                </main>
                                <Footer />
                                <ScrollToTop />
                                <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
                                <ReactQueryDevtools initialIsOpen={false} />
                            </div>
                        </AuthProvider>
                    </LoadingProvider>
                </QueryClientProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App;
