import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    BlogFilters,
    useBlogPost,
    useBlogStats,
    useDeleteBlogPost,
} from "@/hooks/queries/blogQueries";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AlertMessage } from "@/components/common/AlertMessage";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMetaTags } from "@/hooks/useMetaTags";
import { ShareButton } from "@/components/share/ShareButton";
import { SearchWidget } from "@/components/blog/SearchWidget";
import "@/styles/toast.css";
import "@/styles/blog.css";

export function BlogDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { canCreateProjects: canEdit } = useStaffPermissions();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    const { data: post, isLoading, error } = useBlogPost(slug!);

    const { data: statsData, isLoading: _statsLoading } = useBlogStats();

    const popularTags = statsData?.popular_tags || [];

    usePageTitle(`Blog - ${post?.title || "Loading..."}`);

    // Set meta tags for SEO and social sharing
    useMetaTags({
        title: post?.title || "Blog Post",
        description:
            post?.excerpt ||
            "Read this blog post on Ethan Wanyoike's portfolio",
        keywords:
            post?.tags_list?.join(", ") ||
            "blog, portfolio, software engineering",
        ogTitle: `${post?.title || "Blog Post"} - Ethan Wanyoike`,
        ogDescription:
            post?.excerpt ||
            "Read this blog post on Ethan Wanyoike's portfolio",
        ogType: "article",
        ogUrl: `${window.location.origin}/blog/article/${slug}`,
        ogImage: post?.cover_image_url || post?.featured_image_url,
        twitterTitle: `${post?.title || "Blog Post"} - Ethan Wanyoike`,
        twitterDescription:
            post?.excerpt ||
            "Read this blog post on Ethan Wanyoike's portfolio",
        twitterImage: post?.cover_image_url || post?.featured_image_url,
        canonical: `${window.location.origin}/blog/article/${slug}`,
    });

    const deleteBlogPostMutation = useDeleteBlogPost();

    const handleDelete = async () => {
        if (!post) return;

        try {
            await deleteBlogPostMutation.mutateAsync(post.slug);
            navigate("/blog");
        } catch {
            // Error is handled by the mutation's error state
        }
    };

    const [filters, setFilters] = useState<BlogFilters>({
        page: 1,
        page_size: 6,
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters: BlogFilters = { page: 1, page_size: 6 };

        if (urlParams.get("tag")) initialFilters.tag = urlParams.get("tag")!;
        if (urlParams.get("search"))
            initialFilters.tag = urlParams.get("search")!;

        setFilters(initialFilters);
    }, []);

    /* const {
        data: postsData,
        isLoading: postsLoading,
        error: postsError,
    } = useBlogPosts(filters);

    const posts = postsData?.results || [];
    const totalCount = postsData?.count || 0; */

    const handleFiltersChange = (newFilters: BlogFilters) => {
        setFilters(newFilters);
        // Update URL without causing navigation
        const url = new URL(window.location.href);
        url.search = "";
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, value.toString());
            }
        });
        window.history.replaceState({}, "", url.toString());
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !post) {
        return (
            <div className="container my-5">
                <AlertMessage
                    type="danger"
                    message="Blog post not found. It may have been moved or deleted."
                />
                <div className="text-center mt-4">
                    <Link to="/blog" className="btn btn-primary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    if (!slug) {
        return (
            <AlertMessage
                type="danger"
                message="Invalid blog post URL. Please check the address and try again."
            />
        );
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !post) {
        return (
            <div className="container my-5">
                <AlertMessage
                    type="danger"
                    message="Blog post not found. It may have been moved or deleted."
                />

                <div className="text-center mt-4">
                    <Link to="/blog" className="btn btn-primary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-title">
                <div className="container d-lg-flex justify-content-between">
                    <nav className="breadcrumbs">
                        <ol>
                            <li>
                                <Link to={`/`}>Home</Link>
                            </li>
                            <li>
                                <Link to="/blog">Blog</Link>
                            </li>
                            <li>Article</li>
                        </ol>
                    </nav>
                </div>
            </div>
            <section className="blog">
                {/* Toast Notification */}
                <div
                    className="position-fixed top-0 end-50 p-3"
                    style={{ zIndex: 1050 }}
                >
                    <div
                        className={`toast ${showToast ? "show" : ""}`}
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="toast-body d-flex bg-success justify-content-between">
                            <span>
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Link copied to clipboard!
                            </span>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowToast(false)}
                            ></button>
                        </div>
                    </div>
                </div>

                <div className="container my-2">
                    <div className="row">
                        <div className="col-12 col-lg-8">
                            <article className="entry entry-single p-1">
                                {/* Featured Image */}
                                {post.featured_image_url && (
                                    <div className="entry-img my-3 mx-1">
                                        <img
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            className="img-fluid rounded"
                                            style={{
                                                width: "100%",
                                                height: "400px",
                                                objectFit: "cover",
                                            }}
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                {/* Edit/Delete Buttons */}
                                {canEdit && (
                                    <div className="d-flex justify-content-start align-items-center text-muted mb-3">
                                        <div className="mb-2 entry-meta">
                                            <div
                                                className="btn-group gap-3 gap-lg-5"
                                                role="group"
                                            >
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/blog/edit/${post.slug}`,
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit Article
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        setShowDeleteModal(true)
                                                    }
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Delete Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Post Header */}
                                <div className="entry-meta">
                                    <ul className="d-flex justify-content-start justify-content-md-start">
                                        <li className="d-flex align-items-center">
                                            <i className="bi bi-person me-1"></i>
                                            <span>{post.author}</span>
                                        </li>
                                        <li className="d-flex align-items-center">
                                            <i className="bi bi-calendar me-1"></i>
                                            <span>
                                                {formatDate(
                                                    post.first_published_at,
                                                )}
                                            </span>
                                        </li>
                                        <li className="d-none d-lg-flex align-items-center">
                                            <i className="bi bi-clock me-1"></i>
                                            <span>{post.reading_time}</span>
                                        </li>
                                        <li>
                                            <i className="bi bi-eye"></i>
                                            <span className="text-decoration-none">
                                                {post?.view_count
                                                    ? post?.view_count === 1
                                                        ? `${post?.view_count} view`
                                                        : `${post?.view_count} views`
                                                    : 0}
                                            </span>
                                        </li>
                                        <li className="d-flex align-items-center">
                                            <ShareButton
                                                url={window.location.href}
                                                title={post.title}
                                                imageUrl={
                                                    post.featured_image_url ||
                                                    post.cover_image_url
                                                }
                                                description={post.excerpt}
                                                variant="icon"
                                                size="sm"
                                                className="btn-sm special-btn"
                                            />
                                        </li>
                                    </ul>
                                </div>

                                <h2 className="entry-title">{post.title}</h2>
                                {/* Post Content */}
                                <div
                                    className="mb-3 entry-content blog-content"
                                    dangerouslySetInnerHTML={{
                                        __html: post.content,
                                    }}
                                />

                                {/* Tags and Share */}
                                <div className="entry-footer d-flex justify-content-between px-2 align-items-center">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-tags me-2"></i>
                                        {post.tags_list &&
                                            post.tags_list.length > 0 && (
                                                <ul className="tags mx-0">
                                                    {post.tags_list.map(
                                                        (tag) => (
                                                            <li key={tag}>
                                                                <Link
                                                                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                                                                    className="text-decoration-none me-0"
                                                                >
                                                                    {tag}
                                                                </Link>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <ShareButton
                                            url={window.location.href}
                                            title={post.title}
                                            imageUrl={
                                                post.featured_image_url ||
                                                post.cover_image_url
                                            }
                                            description={post.excerpt}
                                            variant="both"
                                            size="sm"
                                            className="btn-outline-secondary"
                                        />
                                    </div>
                                </div>
                            </article>
                        </div>

                        <div className="col-lg-4 sidebar">
                            <div
                                className="widget-items-container"
                                style={{ top: "2rem" }}
                            >
                                {/* Recent Posts */}
                                {statsData?.recent_posts &&
                                    statsData.recent_posts.length > 0 && (
                                        <div className="widget-item recent-posts-widget">
                                            <div className="widget-title">
                                                <h3 className="mb-0">
                                                    Recent Posts
                                                </h3>
                                            </div>
                                            {statsData.recent_posts
                                                .slice(0, 5)
                                                .map((post) => (
                                                    <div
                                                        key={post.id}
                                                        className="post-item"
                                                    >
                                                        {post.featured_image_url ? (
                                                            <img
                                                                src={
                                                                    post.featured_image_url
                                                                }
                                                                alt={post.title}
                                                                className="rounded me-3"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="bg-light-dark d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    height: "50px",
                                                                    width: "50px",
                                                                    marginRight:
                                                                        "1rem",
                                                                }}
                                                            >
                                                                <div className="d-flex flex-column justify-content-between align-items-center">
                                                                    <i
                                                                        className="bi bi-image text-muted"
                                                                        style={{
                                                                            fontSize:
                                                                                "3rem",
                                                                        }}
                                                                    ></i>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex-grow-1">
                                                            <h4>
                                                                <Link
                                                                    to={`/blog/article/${post.slug}`}
                                                                    className="text-decoration-none fw-medium"
                                                                >
                                                                    {post.title}
                                                                </Link>
                                                            </h4>
                                                            <time
                                                                dateTime={formatDate(
                                                                    post.first_published_at,
                                                                )}
                                                                className="small text-muted"
                                                            >
                                                                {formatDate(
                                                                    post.first_published_at,
                                                                )}
                                                            </time>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                <SearchWidget
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    tags={popularTags}
                                />
                            </div>
                        </div>
                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="modal show d-block" tabIndex={-1}>
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">
                                                Confirm Delete
                                            </h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() =>
                                                    setShowDeleteModal(false)
                                                }
                                            >
                                                <span aria-hidden="true">
                                                    &times;
                                                </span>
                                            </button>
                                        </div>

                                        <div className="modal-body">
                                            <p>
                                                Are you sure you want to delete
                                                this blog post?
                                            </p>
                                            <p className="text-muted">
                                                <strong>"{post?.title}"</strong>
                                            </p>
                                            <p className="text-danger">
                                                <small>
                                                    This action cannot be
                                                    undone.
                                                </small>
                                            </p>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() =>
                                                    setShowDeleteModal(false)
                                                }
                                            >
                                                Cancel{" "}
                                                <i className="bi bi-x-lg ms-1"></i>
                                            </button>

                                            <button
                                                onClick={handleDelete}
                                                type="button"
                                                className="btn btn-danger"
                                                disabled={
                                                    deleteBlogPostMutation.isPending
                                                }
                                            >
                                                {deleteBlogPostMutation.isPending ? (
                                                    <>
                                                        <LoadingSpinner
                                                            size="sm"
                                                            className="me-2"
                                                        />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    "Delete Post"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showDeleteModal && (
                            <div className="modal-backdrop show"></div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
