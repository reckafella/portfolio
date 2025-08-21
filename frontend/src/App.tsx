import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'
import DynamicFormExample from './pages/DynamicFormExample'
import SearchResults from './pages/SearchResults'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ScrollToTop from './components/utils/ScrollToTop'
import SearchOverlay from './components/search/SearchOverlay'
import LoginForm from './components/forms/LoginForm'
import SignupForm from './components/forms/SignupForm'
import LogoutPage from './pages/auth/LogoutPage'
import { SigninRedirect, SignupRedirect, SignoutRedirect } from './components/redirection/AuthRedirect'
import AuthProvider from './hooks/useAuth'
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
                                <Route path="/signup" element={<SignupRedirect />} />
                                <Route path="/register" element={<SignupForm />} />
                                <Route path="/signout" element={<SignoutRedirect />} />
                                <Route path="/logout" element={<LogoutPage />} />
                            </Routes>
                        </main>
                        <Footer />
                        <ScrollToTop />
                        <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
                    </div>
                </AuthProvider>
            </QueryClientProvider>
        </Router>
    )
}

export default App;
