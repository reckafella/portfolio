import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { BlogFilters } from "@/hooks/queries/blogQueries";

interface SearchWidgetProps {
    filters: BlogFilters;
    onFiltersChange: (_filters: BlogFilters) => void;
    tags: Array<{ name: string; count: number }>;
}

export function SearchWidget({
    filters,
    onFiltersChange,
    tags,
}: SearchWidgetProps) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [selectedTag, setSelectedTag] = useState(filters.tag || "");
    const [selectedYear, setSelectedYear] = useState(filters.year || "");
    const [selectedMonth, setSelectedMonth] = useState(filters.month || "");
    const [selectedSort, setSelectedSort] = useState(
        filters.ordering || "-first_published_at",
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFiltersChange({
            ...filters,
            search: searchValue || undefined,
            page: 1,
        });
    };

    const handleFilterApply = () => {
        onFiltersChange({
            ...filters,
            tag: selectedTag || undefined,
            year: selectedYear ? parseInt(selectedYear as string) : undefined,
            month: selectedMonth
                ? parseInt(selectedMonth as string)
                : undefined,
            page: 1,
        });
        setShowFilterModal(false);
    };

    const handleSortApply = () => {
        onFiltersChange({
            ...filters,
            ordering: selectedSort,
            page: 1,
        });
        setShowSortModal(false);
    };

    const clearFilters = () => {
        setSelectedTag("");
        setSelectedYear("");
        setSelectedMonth("");
        onFiltersChange({
            ...filters,
            tag: undefined,
            year: undefined,
            month: undefined,
            page: 1,
        });
        setShowFilterModal(false);
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

    const sortOptions = [
        { value: "-first_published_at", label: "Newest First" },
        { value: "first_published_at", label: "Oldest First" },
        { value: "-view_count", label: "Most Popular" },
        { value: "title", label: "Title A-Z" },
        { value: "-title", label: "Title Z-A" },
    ];

    return (
        <>
            <div className="widget-item search-widget gap-3 mb-3">
                <div className="col-12">
                    <h3 className="widget-title">Search My Blog</h3>
                    <form
                        onSubmit={handleSearchSubmit}
                        className="position-relative"
                    >
                        <input
                            type="search"
                            name="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="form-control"
                            placeholder="Search..."
                            required
                        />
                        <button
                            type="submit"
                            className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent pe-3"
                            style={{ zIndex: 10 }}
                        >
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                </div>

                {/* Filter and Sort Buttons */}
                <div className="d-flex my-4 gap-3 mb-3">
                    <Button
                        variant="primary"
                        size="sm"
                        className="rounded-pill flex-grow-1"
                        onClick={() => setShowFilterModal(true)}
                    >
                        <i className="bi bi-funnel"></i>
                        <span className="d-inline ms-1">Filter</span>
                    </Button>
                    <Button
                        variant="success"
                        size="sm"
                        className="rounded-pill flex-grow-1"
                        onClick={() => setShowSortModal(true)}
                    >
                        <i className="bi bi-sort-down"></i>
                        <span className="d-inline ms-1">Sort</span>
                    </Button>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                dialogClassName="filter-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-funnel me-2"></i>
                        Filter Posts
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">Filter by Tag</label>
                        <select
                            className="form-select"
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                        >
                            <option value="">All Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.name} value={tag.name}>
                                    {tag.name} ({tag.count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Year</label>
                        <select
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Month</label>
                        <select
                            className="form-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="">All Months</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={clearFilters}>
                        <i className="bi bi-x me-1"></i>
                        Clear
                    </Button>
                    <Button variant="primary" onClick={handleFilterApply}>
                        <i className="bi bi-check me-1"></i>
                        Apply Filters
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Sort Modal */}
            <Modal
                show={showSortModal}
                onHide={() => setShowSortModal(false)}
                centered
                dialogClassName="sort-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-sort-down me-2"></i>
                        Sort Posts
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">Sort By</label>
                        <select
                            className="form-select"
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value)}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowSortModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleSortApply}>
                        <i className="bi bi-check me-1"></i>
                        Apply Sort
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
