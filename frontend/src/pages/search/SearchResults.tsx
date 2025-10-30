import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMetaTags } from "@/hooks/useMetaTags";
import { ShareButton } from "@/components/share";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface SearchResult {
    id: string | number;
    title: string;
    description?: string;
    content?: string;
    url: string;
    type: "blog_post" | "project" | "action";
    action_type?: string;
    icon?: string;
    tags?: string[];
    category?: string;
    project_type?: string;
    client?: string;
    project_url?: string;
    created_at?: string;
    first_published_at?: string;
    view_count?: number;
    author?: {
        username: string;
        full_name?: string;
    };
    first_image?: {
        optimized_image_url?: string;
    };
}

interface SearchResultsData {
    posts: SearchResult[];
    projects: SearchResult[];
    actions: SearchResult[];
}

const SearchResults: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "relevance";

    const [results, setResults] = useState<SearchResultsData>({
        posts: [],
        projects: [],
        actions: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [activeTab, setActiveTab] = useState<
        "posts" | "projects" | "actions"
    >("posts");
    const [searchInput, setSearchInput] = useState(query);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [selectedSort, setSelectedSort] = useState(sort);

    usePageTitle(`Search Results for "${query}"`);
    useMetaTags({
        title: `Search Results for "${query}"`,
        description: `Search results for "${query}"`,
        keywords: `search, results, ${query}`,
        author: "Ethan Wanyoike",
        ogTitle: `Search Results for "${query}"`,
        ogDescription: `Search results for "${query}"`,
        ogType: "website",
        ogUrl: `${window.location.origin}/search?q=${query}`,
        ogImage: "/static/assets/images/logo-og.png",
        twitterCard: "summary_large_image",
        twitterTitle: `Search Results for "${query}"`,
        twitterDescription: `Search results for "${query}"`,
        twitterImage: "/static/assets/images/logo-og.png",
        twitterSite: "@frmundu",
        twitterCreator: "@frmundu",
        canonical: `${window.location.origin}/search?q=${query}`,
    });

    useEffect(() => {
        if (query) {
            performSearch(query, category, sort);
            setSearchInput(query);
        }
    }, [query, category, sort]);

    useEffect(() => {
        setSelectedCategory(category);
        setSelectedSort(sort);
    }, [category, sort]);

    const performSearch = async (
        searchQuery: string,
        searchCategory: string,
        searchSort: string,
    ) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                category: searchCategory,
                sort: searchSort,
                page_size: "20",
            });

            const response = await fetch(`/api/v1/search/?${params}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setResults(data.results);
                setTotalResults(data.total_results);
            } else {
                setError(data.message || "Search failed");
                setResults({ posts: [], projects: [], actions: [] });
                setTotalResults(0);
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "An error occurred while searching",
            );
            setResults({ posts: [], projects: [], actions: [] });
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    const renderBlogPost = (post: SearchResult) => (
        <div key={`post-${post.id}`} className="col">
            <article className="card entry shadow-sm rounded p-1 h-100">
                <h2 className="entry-title">
                    <Link to={post.url} className="text-decoration-none">
                        {post.title}
                    </Link>
                </h2>

                {post.first_image?.optimized_image_url && (
                    <div className="entry-img my-1">
                        <img
                            src={post.first_image.optimized_image_url}
                            alt={post.title || "Post image"}
                            className="img-fluid rounded"
                            loading="lazy"
                        />
                    </div>
                )}

                <div className="entry-meta mb-1">
                    <ul className="list-unstyled bg-transparent d-flex align-items-center flex-wrap gap-1">
                        {post.author && (
                            <li className="d-flex justify-content-between align-items-center">
                                <i className="bi bi-person me-1"></i>
                                <Link
                                    to={`/blog/author/${post.author.username}`}
                                    className="text-decoration-none"
                                >
                                    {post.author.full_name ||
                                        post.author.username}
                                </Link>
                            </li>
                        )}
                        {post.first_published_at && (
                            <li className="d-flex justify-content-between align-items-center">
                                <i className="bi bi-clock me-1"></i>
                                <span className="date-links">
                                    {format(
                                        new Date(post.first_published_at),
                                        "MMM dd, yyyy",
                                    )}
                                </span>
                            </li>
                        )}
                        <li className="d-flex justify-content-between align-items-center">
                            <ShareButton
                                url={post.url}
                                title={post.title}
                                variant="icon"
                                size="sm"
                                imageUrl={post.first_image?.optimized_image_url}
                                description={post.description}
                                className="btn-sm special-btn bg-transparent"
                            />
                        </li>
                    </ul>
                </div>

                <div className="entry-content">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: post.content
                                ? post.content.substring(0, 200) + "..."
                                : post.description || "",
                        }}
                    />
                </div>

                <div className="entry-footer d-flex justify-content-center align-items-center mt-1 p-1">
                    <Link
                        to={post.url}
                        className="read-article btn btn-sm btn-success"
                    >
                        Read Article <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                </div>
            </article>
        </div>
    );

    const renderProject = (project: SearchResult) => (
        <div key={`project-${project.id}`} className="col">
            <div className="card h-100 search-result-card hover-shadow transition-300">
                <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                        <span className="badge bg-success me-2">Project</span>
                        <small className="text-muted">
                            {project.created_at
                                ? format(
                                      new Date(project.created_at),
                                      "MMM dd, yyyy",
                                  )
                                : ""}
                        </small>
                    </div>
                    <h4 className="card-title fw-bold">{project.title}</h4>
                    <p className="card-text text-muted">
                        {project.description
                            ? project.description.substring(0, 150) + "..."
                            : ""}
                    </p>

                    {project.tags && project.tags.length > 0 && (
                        <div className="mb-3">
                            <div className="d-flex gap-1 flex-wrap">
                                {project.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="badge bg-secondary"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {project.tags.length > 3 && (
                                    <span className="badge">
                                        +{project.tags.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {project.project_url ? (
                        <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-info stretched-link"
                        >
                            View Project{" "}
                            <i className="bi bi-box-arrow-up-right ms-1"></i>
                        </a>
                    ) : (
                        <Link
                            to={project.url}
                            className="btn btn-sm btn-info stretched-link"
                        >
                            View Details{" "}
                            <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAction = (action: SearchResult) => (
        <div key={`action-${action.id}`} className="col">
            <div className="card h-100">
                <div className="card-body text-center">
                    <i
                        className={`bi ${action.icon || "bi-lightning"} display-4 text-warning mb-3`}
                    ></i>
                    <h5 className="card-title">{action.title}</h5>
                    <p className="card-text text-muted">{action.description}</p>
                    <Link to={action.url} className="btn btn-warning">
                        {action.title}{" "}
                        <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                </div>
            </div>
        </div>
    );

    // Determine which tab should be active based on results
    useEffect(() => {
        if (results.actions.length > 0) {
            setActiveTab("actions");
        } else if (results.posts.length > 0) {
            setActiveTab("posts");
        } else if (results.projects.length > 0) {
            setActiveTab("projects");
        }
    }, [results]);

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({
                q: searchInput.trim(),
                category: selectedCategory,
                sort: selectedSort,
            });
        }
    };

    // Handle filter apply
    const handleFilterApply = () => {
        setSearchParams({
            q: query,
            category: selectedCategory,
            sort: selectedSort,
        });
        setShowFilterModal(false);
    };

    // Handle sort apply
    const handleSortApply = () => {
        setSearchParams({
            q: query,
            category: selectedCategory,
            sort: selectedSort,
        });
        setShowSortModal(false);
    };

    const filterOptions = {
        all: "All Results",
        posts: "Blog Posts",
        projects: "Projects",
        actions: "Actions",
    };

    const sortOptions = {
        relevance: "Relevance",
        date_desc: "Date (Newest First)",
        date_asc: "Date (Oldest First)",
        title_asc: "Title (A-Z)",
        title_desc: "Title (Z-A)",
    };

    return (
        <div className="min-vh-100">
            {/* Breadcrumb */}
            <div className="page-title py-1">
                <div className="container">
                    <nav className="breadcrumbs" aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/">Home</Link>
                            </li>
                            <li
                                className="breadcrumb-item active"
                                aria-current="page"
                            >
                                Search
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <section id="section-search" className="section py-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="card bg-transparent row justify-content-center mb-4">
                                <div className="card-header border-0">
                                    <h1 className="fw-bold mt-3 text-center section-title">
                                        {totalResults > 0
                                            ? `Search Results for "${query}"`
                                            : "Search Results"}
                                    </h1>

                                    {/* Search Form */}
                                    <div className="row g-3 mb-3">
                                        <div className="search-widget col-md-8 col-lg-7 mx-auto">
                                            <form
                                                className="position-relative"
                                                onSubmit={handleSearchSubmit}
                                            >
                                                <input
                                                    type="search"
                                                    className="form-control form-control-sm form-control-lg rounded-pill ps-4"
                                                    placeholder="Type to Search..."
                                                    aria-label="Search"
                                                    value={searchInput}
                                                    onChange={(e) =>
                                                        setSearchInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-sm btn-lg position-absolute top-50 end-0 translate-middle-y rounded-pill px-3"
                                                    aria-label="Search"
                                                >
                                                    <i className="bi bi-search"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Filter and Sort Controls */}
                                    {totalResults > 0 && (
                                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-2">
                                            <button
                                                type="button"
                                                className="btn btn-success rounded-pill px-4"
                                                onClick={() =>
                                                    setShowSortModal(true)
                                                }
                                            >
                                                <i className="bi bi-sort-down me-2"></i>
                                                <span>Sort Results</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary rounded-pill px-4"
                                                onClick={() =>
                                                    setShowFilterModal(true)
                                                }
                                            >
                                                <i className="bi bi-funnel me-2"></i>
                                                <span>Filter Results</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card-body bg-transparent border-0 py-0">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <LoadingSpinner
                                                text={`Searching for "${query}"`}
                                            />
                                        </div>
                                    ) : error ? (
                                        <div className="alert alert-danger text-center">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    ) : totalResults === 0 ? (
                                        <div className="text-center py-5">
                                            <h1 className="d-flex align-items-center justify-content-center">
                                                No results found
                                                <span className="text-muted">
                                                    <i className="bi bi-search ms-2 fs-3"></i>
                                                </span>
                                            </h1>
                                            <p className="text-muted">
                                                Try adjusting your search terms
                                                or filters.
                                            </p>
                                            <Link
                                                to="/"
                                                className="btn btn-primary mt-3"
                                            >
                                                <i className="bi bi-house me-2"></i>
                                                Return to Home
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Tabs */}
                                            {(results.posts.length > 0 ||
                                                results.projects.length >
                                                    0) && (
                                                <ul
                                                    className="nav nav-pills nav-tabs-bordered mb-4"
                                                    id="searchTabs"
                                                    role="tablist"
                                                >
                                                    {results.actions.length >
                                                        0 && (
                                                        <li
                                                            className="nav-item"
                                                            role="presentation"
                                                        >
                                                            <button
                                                                className={`nav-link fw-bold py-2 px-1 px-md-3 ${activeTab === "actions" ? "active" : ""}`}
                                                                onClick={() =>
                                                                    setActiveTab(
                                                                        "actions",
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                Quick Actions{" "}
                                                                <span className="ms-1">
                                                                    (
                                                                    {
                                                                        results
                                                                            .actions
                                                                            .length
                                                                    }
                                                                    )
                                                                </span>
                                                            </button>
                                                        </li>
                                                    )}
                                                    {results.posts.length >
                                                        0 && (
                                                        <li
                                                            className="nav-item"
                                                            role="presentation"
                                                        >
                                                            <button
                                                                className={`nav-link fw-bold py-2 px-1 px-md-3 ${activeTab === "posts" ? "active" : ""}`}
                                                                onClick={() =>
                                                                    setActiveTab(
                                                                        "posts",
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                Blog Articles{" "}
                                                                <span className="ms-1">
                                                                    (
                                                                    {
                                                                        results
                                                                            .posts
                                                                            .length
                                                                    }
                                                                    )
                                                                </span>
                                                            </button>
                                                        </li>
                                                    )}
                                                    {results.projects.length >
                                                        0 && (
                                                        <li
                                                            className="nav-item"
                                                            role="presentation"
                                                        >
                                                            <button
                                                                className={`nav-link fw-bold py-2 px-1 px-md-3 ${activeTab === "projects" ? "active" : ""}`}
                                                                onClick={() =>
                                                                    setActiveTab(
                                                                        "projects",
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                Projects{" "}
                                                                <span className="ms-1">
                                                                    (
                                                                    {
                                                                        results
                                                                            .projects
                                                                            .length
                                                                    }
                                                                    )
                                                                </span>
                                                            </button>
                                                        </li>
                                                    )}
                                                </ul>
                                            )}

                                            {/* Tab Content */}
                                            <div className="blog bg-transparent border-0 tab-content pt-2">
                                                {/* Actions Tab */}
                                                {results.actions.length > 0 && (
                                                    <div
                                                        className={`tab-pane fade ${activeTab === "actions" ? "show active" : ""}`}
                                                    >
                                                        <div className="row row-cols-1 row-cols-md-2 g-4">
                                                            {results.actions.map(
                                                                renderAction,
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Blog Posts Tab */}
                                                {results.posts.length > 0 && (
                                                    <div
                                                        className={`tab-pane fade ${activeTab === "posts" ? "show active" : ""}`}
                                                    >
                                                        <div className="row row-cols-1 row-cols-md-2 g-2">
                                                            {results.posts.map(
                                                                renderBlogPost,
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Projects Tab */}
                                                {results.projects.length >
                                                    0 && (
                                                    <div
                                                        className={`tab-pane fade ${activeTab === "projects" ? "show active" : ""}`}
                                                    >
                                                        <div className="row row-cols-1 row-cols-md-2 g-4">
                                                            {results.projects.map(
                                                                renderProject,
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Modal */}
            {showFilterModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content">
                            <div className="modal-header py-2">
                                <h5 className="modal-title">
                                    Filtering Options
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFilterModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12 p-2">
                                        <select
                                            className="form-select form-select-sm"
                                            value={selectedCategory}
                                            onChange={(e) =>
                                                setSelectedCategory(
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {Object.entries(filterOptions).map(
                                                ([key, value]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {value}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer py-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleFilterApply}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {showSortModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content">
                            <div className="modal-header py-2">
                                <h5 className="modal-title">Sorting Options</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowSortModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12 p-2">
                                        <select
                                            className="form-select form-select-sm"
                                            value={selectedSort}
                                            onChange={(e) =>
                                                setSelectedSort(e.target.value)
                                            }
                                        >
                                            {Object.entries(sortOptions).map(
                                                ([key, value]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {value}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer py-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowSortModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleSortApply}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
