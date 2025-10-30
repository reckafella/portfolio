import { useState, useEffect } from "react";
import { BlogFilters } from "@/hooks/queries/blogQueries";

interface BlogFiltersProps {
    filters: BlogFilters;
    onFiltersChange: (_filters: BlogFilters) => void;
    tags: Array<{ name: string; count: number }>;
    totalCount: number;
}

export function BlogFiltersComponent({
    filters,
    onFiltersChange,
    tags,
    totalCount,
}: BlogFiltersProps) {
    const [expandFilters, setExpandFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<BlogFilters>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = (
        key: keyof BlogFilters,
        value: string | number | undefined,
    ) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFiltersChange({
            ...localFilters,
            page: 1,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            page: 1,
            page_size: filters.page_size,
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    return (
        <div className="p-1 card rounded mb-2 mb-lg-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0 d-flex">
                    Filter Posts (
                    <p className="text-muted mb-1">
                        {totalCount > 0 &&
                            `${totalCount} post${totalCount !== 1 ? "s" : ""} found`}
                        {totalCount === 0 && "No posts found"}
                    </p>
                    )
                </h6>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setExpandFilters(!expandFilters)}
                    aria-expanded={expandFilters}
                >
                    {expandFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>
            <form
                onSubmit={handleSubmit}
                className="bg-transparent form-control"
            >
                <div className="card-body p-1">
                    {/* Search Input - Always Visible */}
                    <div className="mb-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search blog posts..."
                                value={localFilters.search || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "search",
                                        e.target.value || undefined,
                                    )
                                }
                            />
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-footer border-top-0 p-0 px-1">
                    {/* Collapsible Filters */}
                    <div className={`collapse ${expandFilters ? "show" : ""}`}>
                        <div className="row g-3">
                            {/* Tags Filter */}
                            <div className="col-md-4">
                                <label className="form-label">
                                    Filter by Tag
                                </label>
                                <select
                                    className="form-select"
                                    value={localFilters.tag || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "tag",
                                            e.target.value || undefined,
                                        )
                                    }
                                >
                                    <option value="">All Tags</option>
                                    {tags.map((tag) => (
                                        <option key={tag.name} value={tag.name}>
                                            {tag.name} ({tag.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year Filter */}
                            <div className="col-md-3">
                                <label className="form-label">Year</label>
                                <select
                                    className="form-select"
                                    value={localFilters.year || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "year",
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        )
                                    }
                                >
                                    <option value="">All Years</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Filter */}
                            <div className="col-md-3">
                                <label className="form-label">Month</label>
                                <select
                                    className="form-select"
                                    value={localFilters.month || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "month",
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        )
                                    }
                                >
                                    <option value="">All Months</option>
                                    {months.map((month) => (
                                        <option
                                            key={month.value}
                                            value={month.value}
                                        >
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div className="col-md-4">
                                <label className="form-label">Sort By</label>
                                <select
                                    className="form-select"
                                    value={
                                        localFilters.ordering ||
                                        "-first_published_at"
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "ordering",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="-first_published_at">
                                        Newest First
                                    </option>
                                    <option value="first_published_at">
                                        Oldest First
                                    </option>
                                    <option value="-view_count">
                                        Most Popular
                                    </option>
                                    <option value="title">Title A-Z</option>
                                    <option value="-title">Title Z-A</option>
                                </select>
                            </div>

                            {/* Posts Per Page */}
                            <div className="col-md-3">
                                <label className="form-label">
                                    Posts Per Page
                                </label>
                                <select
                                    className="form-select"
                                    value={localFilters.page_size || 6}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "page_size",
                                            parseInt(e.target.value),
                                        )
                                    }
                                >
                                    <option value={6}>6 posts</option>
                                    <option value={12}>12 posts</option>
                                    <option value={18}>18 posts</option>
                                </select>
                            </div>

                            {/* Apply and Clear Filters */}
                            <div className="col-md-3 d-flex align-items-end gap-2">
                                <button
                                    type="submit"
                                    className="btn d-flex justify-content-center align-items-center btn-primary flex-grow-1"
                                >
                                    <i className="bi bi-search me-1"></i>
                                    Apply
                                </button>
                                <button
                                    className="btn d-flex btn-outline-secondary"
                                    onClick={clearFilters}
                                    type="button"
                                >
                                    <i className="bi bi-x me-1"></i>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
