import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
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
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('search-active');
    };
  }, [isOpen]);

  return (
    <div 
      id="full-page-search" 
      className={isOpen ? "open" : ""}
      onClick={(e) => {
        // Close search when clicking on overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <button 
        type="button" 
        className="close"
        onClick={onClose}
        aria-label="Close search"
      >
        <i className="bi bi-x-lg"></i>
      </button>
      
      <div className="search-container">
        <div className="search-header">
          <h2>Search</h2>
        </div>
        
        <form 
          onSubmit={handleSearch}
          className="d-flex flex-column align-items-center gap-3 gap-lg-5 w-100"
        >
          <input 
            ref={searchInputRef}
            type="search" 
            name="q" 
            id="search-input" 
            className="typed-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, blog posts..." 
            required 
          />
          
          <button 
            type="submit" 
            className="btn btn-success fw-bold"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchOverlay;
