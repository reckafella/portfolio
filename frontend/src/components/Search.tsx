import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchProps {
  className?: string;
}

const Search: React.FC<SearchProps> = ({ className = "" }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  return (
    <>
      {/* Search Toggle Button */}
      <div className={`d-block search-icon ${className}`}>
        <button 
          type="button" 
          role="button" 
          className="search-bar-toggle"
          onClick={toggleSearch}
          aria-label="Open search"
          title="Search"
        >
          <i className="bi bi-search"></i>
        </button>
      </div>

      {/* Search Overlay */}
      <div 
        id="full-page-search" 
        className={`search-overlay ${isSearchOpen ? 'search-active' : ''}`}
        onClick={(e) => {
          // Close search when clicking on overlay background
          if (e.target === e.currentTarget) {
            closeSearch();
          }
        }}
      >
        <button 
          type="button" 
          className="search-close"
          onClick={closeSearch}
          aria-label="Close search"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        
        <div className="search-container">
          <div className="search-header">
            <h2>Search</h2>
            <p className="text-muted">Find projects, blog posts, and more</p>
          </div>
          
          <form 
            onSubmit={handleSearch}
            className="d-flex flex-column align-items-center gap-3 gap-lg-4 w-100"
          >
            <div className="search-input-wrapper">
              <input 
                ref={searchInputRef}
                type="search" 
                name="q" 
                id="search-input" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, blog posts..." 
                required 
              />
              <i className="bi bi-search search-input-icon"></i>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg px-4"
              disabled={!searchQuery.trim()}
            >
              <i className="bi bi-search me-2"></i>
              Search
            </button>
            
            <div className="search-shortcuts text-muted small">
              <kbd>Esc</kbd> to close • <kbd>Enter</kbd> to search
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Search;
