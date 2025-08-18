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
import ScrollToTop from './components/ScrollToTop'
import SearchOverlay from './components/SearchOverlay'
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
                        </Routes>
                    </main>
                    <Footer />
                    <ScrollToTop />
                    <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
                </div>
            </QueryClientProvider>
        </Router>
    )
}

export default App;
