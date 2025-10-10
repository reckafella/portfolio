import React from 'react';
import { Link } from 'react-router-dom';
interface SearchProps {
  className?: string;
  onToggleSearch: () => void;
}

const Search: React.FC<SearchProps> = ({ className = "", onToggleSearch }) => {
  return (
    <div className={`d-block search-icon ${className}`}>
      <Link
        to="#"
        type="button" 
        role="button" 
        className="search-bar-toggle"
        onClick={onToggleSearch}
        aria-label="Open search"
        title="Search"
      >
        <i className="bi bi-search"></i>
      </Link>
    </div>
  );
};

export default Search;
