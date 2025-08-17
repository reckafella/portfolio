/* import React from 'react' */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
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
    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                <div className="d-flex flex-column min-vh-100">
                    <Navigation />
                    <main className="flex-grow-1">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/services" element={<ServicesPage />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </QueryClientProvider>
        </Router>
    )
}

export default App;
