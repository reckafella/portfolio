import React, { useRef } from "react";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

interface SearchSuggestion {
    text: string;
    type: "blog_post" | "project" | "tag";
    category: "posts" | "projects";
}

interface SearchSuggestionsProps {
    suggestions: SearchSuggestion[];
    loading: boolean;
    error: string | null;
    onSelect: (suggestion: SearchSuggestion) => void;
    onEscape: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    query: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
    suggestions,
    loading,
    error,
    onSelect,
    onEscape,
    onKeyDown,
    query,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Use keyboard navigation hook
    const { selectedIndex, handleKeyDown } = useKeyboardNavigation({
        items: suggestions,
        onSelect: (suggestion: SearchSuggestion) => {
            onSelect(suggestion);
        },
        onEscape: () => {
            onEscape();
        },
        enabled: suggestions.length > 0,
        loop: true,
    });

    // Forward keyboard events to parent if needed
    const handleKeyDownWrapper = (event: React.KeyboardEvent) => {
        handleKeyDown(event);
        onKeyDown?.(event);
    };

    // Highlight matching text in suggestions
    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;

        const regex = new RegExp(
            `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi",
        );
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="search-highlight">
                    {part}
                </mark>
            ) : (
                part
            ),
        );
    };

    // Get icon for suggestion type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "blog_post":
                return "bi-file-earmark-text";
            case "project":
                return "bi-folder";
            case "tag":
                return "bi-tag";
            default:
                return "bi-search";
        }
    };

    // Get type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "blog_post":
                return "Blog Post";
            case "project":
                return "Project";
            case "tag":
                return "Tag";
            default:
                return "Search";
        }
    };

    // Don't render if no suggestions and not loading
    if (!loading && suggestions.length === 0 && !error) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            onKeyDown={handleKeyDownWrapper}
            tabIndex={-1}
        >
            {loading && (
                <div className="search-suggestion-item search-suggestion-loading">
                    <i className="bi bi-hourglass-split me-2"></i>
                    <span>Searching...</span>
                </div>
            )}

            {error && (
                <div className="search-suggestion-item search-suggestion-error">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && suggestions.length > 0 && (
                <>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.type}-${suggestion.text}-${index}`}
                            className={`search-suggestion-item ${
                                index === selectedIndex
                                    ? "search-suggestion-selected"
                                    : ""
                            }`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            data-index={index}
                            onClick={() => onSelect(suggestion)}
                            onMouseEnter={() => {
                                // Update selected index on hover for better UX
                                if (index !== selectedIndex) {
                                    // This would need to be handled by parent component
                                    // For now, we'll rely on keyboard navigation
                                }
                            }}
                        >
                            <div className="search-suggestion-content">
                                <div className="search-suggestion-icon">
                                    <i
                                        className={`bi ${getTypeIcon(suggestion.type)}`}
                                    ></i>
                                </div>
                                <div className="search-suggestion-text">
                                    <div className="search-suggestion-title">
                                        {highlightText(suggestion.text, query)}
                                    </div>
                                    <div className="search-suggestion-type">
                                        {getTypeLabel(suggestion.type)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {!loading &&
                !error &&
                suggestions.length === 0 &&
                query.length >= 2 && (
                    <div className="search-suggestion-item search-suggestion-empty">
                        <i className="bi bi-search me-2"></i>
                        <span>
                            No suggestions found. Press Enter to search for "
                            {query}"
                        </span>
                    </div>
                )}
        </div>
    );
};

export default SearchSuggestions;
