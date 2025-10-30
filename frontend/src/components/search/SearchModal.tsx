import React, { useState, useEffect, useRef } from 'react';
import { ReactTyped } from 'react-typed';
import { useNavigate } from 'react-router-dom';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { usePopularSearches } from '@/hooks/usePopularSearches';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import SearchSuggestions from './SearchSuggestions';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchSuggestion {
  text: string;
  type: 'blog_post' | 'project' | 'tag';
  category: 'posts' | 'projects';
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Custom hooks
  const { suggestions, loading, error, fetchSuggestions, clearSuggestions } = useSearchSuggestions(500);
  const { popularSearches, recentSearches, addRecentSearch } = usePopularSearches();

  // Keyboard navigation for suggestions
  const { selectedIndex, handleKeyDown, resetSelection } = useKeyboardNavigation({
    items: suggestions,
    onSelect: (suggestion: SearchSuggestion) => {
      handleSearch(suggestion.text);
    },
    onEscape: () => {
      setShowSuggestions(false);
      resetSelection();
    },
    enabled: showSuggestions && suggestions.length > 0,
  });

  // Handle search submission
  const handleSearch = (query: string = searchQuery) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      addRecentSearch(trimmedQuery);
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      onClose();
      setSearchQuery('');
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
      fetchSuggestions(value);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  // Handle popular/recent search click
  const handlePopularSearchClick = (query: string) => {
    handleSearch(query);
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when search is open and add search-active class
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('search-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('search-active');
      setSearchQuery('');
      setShowSuggestions(false);
      clearSuggestions();
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('search-active');
    };
  }, [isOpen, clearSuggestions]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle input key down
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed and we have suggestions with a selected index, let keyboard nav handle it
    if (e.key === 'Enter' && showSuggestions && suggestions.length > 0 && selectedIndex >= 0) {
      handleKeyDown(e);
    } 
    // If Enter is pressed without navigation, submit the search
    else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
    // For arrow keys and other navigation, let keyboard nav handle it
    else if (showSuggestions && suggestions.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape')) {
      handleKeyDown(e);
    }
  };

  return (
    <div 
      id="search-modal" 
      className={`search-modal ${isOpen ? "search-modal-open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="search-modal-container">
        <button 
          type="button" 
          className="search-modal-close"
          onClick={onClose}
          aria-label="Close search"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        
        <div className="search-modal-content">
          <div className="search-modal-header">
            <h2>Search</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
              <i className="bi bi-search search-input-icon"></i>
              <input 
                ref={searchInputRef}
                type="text" 
                name="q" 
                id="search-input" 
                className="search-input"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder=""
                autoComplete="on"
                aria-label="Search"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
                role="searchbox"
              />
              {!searchQuery && (
                <div className="search-input-placeholder">
                  Search{' '}
                  <ReactTyped 
                    strings={["projects", "blog posts", "tags", "topics"]} 
                    typeSpeed={50} 
                    backSpeed={50} 
                    loop 
                  />
                </div>
              )}
              {searchQuery && (
                <button 
                  type="button"
                  className="search-input-clear"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                    clearSuggestions();
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                loading={loading}
                error={error}
                selectedIndex={selectedIndex}
                onSelect={handleSuggestionSelect}
                onEscape={() => {
                  setShowSuggestions(false);
                  resetSelection();
                }}
                query={searchQuery}
              />
            )}
          </form>

          {/* Popular and Recent Searches */}
          {!showSuggestions && searchQuery.length < 2 && (
            <div className="search-sections">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="search-section">
                  <h3 className="search-section-title">
                    <i className="bi bi-clock me-2"></i>
                    Recent Searches
                  </h3>
                  <div className="search-section-items">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="search-section-item"
                        onClick={() => handlePopularSearchClick(search)}
                      >
                        <i className="bi bi-clock me-2"></i>
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div className="search-section">
                  <h3 className="search-section-title">
                    <i className="bi bi-fire me-2"></i>
                    Popular Searches
                  </h3>
                  <div className="search-section-items">
                    {popularSearches.slice(0, 10).map((search, index) => (
                      <button
                        key={index}
                        className="search-section-item"
                        onClick={() => handlePopularSearchClick(search.text)}
                      >
                        <i className="bi bi-search me-2"></i>
                        <span>{search.text}</span>
                        <span className="search-popular-count">({search.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {recentSearches.length === 0 && popularSearches.length === 0 && (
                <div className="search-empty-state">
                  <i className="bi bi-search display-4 text-muted mb-3"></i>
                  <h3>Start searching</h3>
                  <p className="text-muted">
                    Search for projects, blog posts, or browse popular topics.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
