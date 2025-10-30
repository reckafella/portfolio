import React, { useState, useEffect } from "react";

interface ProjectFiltersState {
    search: string;
    category: string;
    project_type: string;
    client: string;
    ordering: string;
}

interface ProjectFiltersProps {
    filters: ProjectFiltersState;
    onFilterChange: (_filters: Partial<ProjectFiltersState>) => void;
    onClearFilters: () => void;
    totalCount: number;
}

interface FilterOptions {
    categories: string[];
    project_types: string[];
    clients: string[];
}

interface FormField {
    name: string;
    choices?: Array<[string, string]>;
}

interface FormConfig {
    fields: FormField[];
}

interface Project {
    client?: string;
}

interface ProjectsResponse {
    results?: Project[];
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    filters,
    onFilterChange,
    onClearFilters,
    totalCount,
}) => {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        project_types: [],
        clients: [],
    });
    const [showFilters, setShowFilters] = useState(false);
    const [expandAccordion, setExpandAccordion] = useState(false);

    // Local state for form inputs to prevent auto-submission
    const [localFilters, setLocalFilters] =
        useState<ProjectFiltersState>(filters);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch("/api/v1/projects/form-config");
            if (response.ok) {
                const config: FormConfig = await response.json();

                // Extract options from form config
                const categories: string[] = [];
                const projectTypes: string[] = [];

                config.fields.forEach((field: FormField) => {
                    if (field.name === "category" && field.choices) {
                        categories.push(
                            ...field.choices.map(
                                (choice: [string, string]) => choice[0],
                            ),
                        );
                    }
                    if (field.name === "project_type" && field.choices) {
                        projectTypes.push(
                            ...field.choices.map(
                                (choice: [string, string]) => choice[0],
                            ),
                        );
                    }
                });

                // Fetch unique clients from projects (you might want to create a separate endpoint for this)
                const clientsResponse = await fetch(
                    "/api/v1/projects/list?page_size=50",
                );
                const clientsData: ProjectsResponse =
                    await clientsResponse.json();
                const uniqueClients = [
                    ...new Set(
                        clientsData.results
                            ?.map((project: Project) => project.client)
                            ?.filter(
                                (
                                    client: string | undefined,
                                ): client is string => Boolean(client?.trim()),
                            ),
                    ),
                ] as string[];

                setFilterOptions({
                    categories,
                    project_types: projectTypes,
                    clients: uniqueClients,
                });
            }
        } catch {
            // Handle error silently or with a toast notification in production
        }
    };

    const toggleAccordion = () => {
        setExpandAccordion(!expandAccordion);
    };

    // Update local filters when props change
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = (
        name: keyof ProjectFiltersState,
        value: string,
    ) => {
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange(localFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            search: "",
            category: "",
            project_type: "",
            client: "",
            ordering: "-created_at",
        };
        setLocalFilters(clearedFilters);
        onClearFilters();
    };

    const hasActiveFilters = Object.entries(filters).some(
        ([key, value]) => key !== "ordering" && value,
    );

    const orderingOptions = [
        { value: "-created_at", label: "Newest First" },
        { value: "created_at", label: "Oldest First" },
        { value: "client", label: "Client Name ASC" },
        { value: "-client", label: "Client Name DESC" },
        { value: "title", label: "Title ASC" },
        { value: "-title", label: "Title DESC" },
        { value: "project_type", label: "Type ASC" },
        { value: "-project_type", label: "Type DESC" },
        { value: "category", label: "Category ASC" },
        { value: "-category", label: "Category DESC" },
    ];

    return (
        <div className="accordion accordion-flush" id="projectFiltersAccordion">
            <div className="accordion-item">
                <h2 className="accordion-header" id="filtersHeading">
                    <button
                        className={`accordion-button ${!expandAccordion ? "collapsed" : ""}`}
                        type="button"
                        aria-controls="filtersCollapse"
                        aria-expanded={expandAccordion}
                        onClick={toggleAccordion}
                    >
                        <i className="bi bi-funnel me-2"></i> Filter & Sort
                        Projects
                    </button>
                </h2>
                <div
                    id="filtersCollapse"
                    className={`accordion-collapse collapse ${expandAccordion ? "show" : ""}`}
                    aria-labelledby="filtersHeading"
                    data-bs-parent="#projectFiltersAccordion"
                >
                    <div className="accordion-body">
                        <form
                            onSubmit={handleSubmit}
                            className="card g-3 form-control"
                        >
                            <div className="card-body row form-group">
                                <div className="col-md-5">
                                    <label
                                        htmlFor="search"
                                        className="form-label"
                                    >
                                        Search Project
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Project..."
                                            value={localFilters.search}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "search",
                                                    e.target.value,
                                                )
                                            }
                                            name="search"
                                            id="search"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label
                                        className="form-label"
                                        htmlFor="sort_by"
                                    >
                                        Sort By
                                    </label>
                                    <select
                                        className="form-select"
                                        id="sort_by"
                                        name="ordering"
                                        value={localFilters.ordering}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "ordering",
                                                e.target.value,
                                            )
                                        }
                                    >
                                        {orderingOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                        type="button"
                                    >
                                        <i
                                            className={`bi bi-filter me-1 ${showFilters ? "text-primary" : ""}`}
                                        ></i>
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="badge bg-primary ms-1">
                                                {
                                                    Object.values(
                                                        filters,
                                                    ).filter(
                                                        (v) =>
                                                            v &&
                                                            v !== "-created_at",
                                                    ).length
                                                }
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        <i className="bi bi-search me-1"></i>
                                        Apply
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            className="btn btn-outline-warning"
                                            onClick={handleClearFilters}
                                            type="button"
                                            title="Clear all filters"
                                        >
                                            <i className="bi bi-x me-1"></i>
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer row justify-content-center align-center">
                                {showFilters && (
                                    <div className="">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label
                                                    htmlFor="categoryFilter"
                                                    className="form-label"
                                                >
                                                    <i className="bi bi-tags me-1"></i>
                                                    Category
                                                </label>
                                                <select
                                                    id="categoryFilter"
                                                    className="form-select"
                                                    name="category"
                                                    value={
                                                        localFilters.category
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "category",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        All Categories
                                                    </option>
                                                    {filterOptions.categories.map(
                                                        (category) => (
                                                            <option
                                                                key={category}
                                                                value={category}
                                                            >
                                                                {category}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>

                                            <div className="col-md-4">
                                                <label
                                                    htmlFor="typeFilter"
                                                    className="form-label"
                                                >
                                                    <i className="bi bi-code me-1"></i>
                                                    Project Type
                                                </label>
                                                <select
                                                    id="typeFilter"
                                                    className="form-select"
                                                    name="project_type"
                                                    value={
                                                        localFilters.project_type
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "project_type",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        All Types
                                                    </option>
                                                    {filterOptions.project_types.map(
                                                        (type) => (
                                                            <option
                                                                key={type}
                                                                value={type}
                                                            >
                                                                {type}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>

                                            <div className="col-md-4">
                                                <label
                                                    htmlFor="clientFilter"
                                                    className="form-label"
                                                >
                                                    <i className="bi bi-user me-1"></i>
                                                    Client
                                                </label>
                                                <select
                                                    id="clientFilter"
                                                    className="form-select"
                                                    name="client"
                                                    value={localFilters.client}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "client",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        All Clients
                                                    </option>
                                                    {filterOptions.clients.map(
                                                        (client) => (
                                                            <option
                                                                key={client}
                                                                value={client}
                                                            >
                                                                {client}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Showing {totalCount} project
                                            {totalCount !== 1 ? "s" : ""}
                                            {hasActiveFilters && " (filtered)"}
                                        </small>

                                        {hasActiveFilters && (
                                            <div className="text-end">
                                                <small className="text-muted me-2">
                                                    Active filters:
                                                </small>
                                                {filters.search && (
                                                    <span className="badge bg-info me-1">
                                                        Search: "
                                                        {filters.search}"
                                                    </span>
                                                )}
                                                {filters.category && (
                                                    <span className="badge bg-success me-1">
                                                        {filters.category}
                                                    </span>
                                                )}
                                                {filters.project_type && (
                                                    <span className="badge bg-primary me-1">
                                                        {filters.project_type}
                                                    </span>
                                                )}
                                                {filters.client && (
                                                    <span className="badge bg-warning me-1">
                                                        {filters.client}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
