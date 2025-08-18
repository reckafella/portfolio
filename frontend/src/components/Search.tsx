import React from 'react';

interface SearchProps {
  className?: string;
  onToggleSearch: () => void;
}

const Search: React.FC<SearchProps> = ({ className = "", onToggleSearch }) => {
  return (
    <div className={`d-block search-icon ${className}`}>
      <button 
        type="button" 
        role="button" 
        className="search-bar-toggle"
        onClick={onToggleSearch}
        aria-label="Open search"
        title="Search"
      >
        <i className="bi bi-search"></i>
      </button>
    </div>
  );
};

export default Search;
