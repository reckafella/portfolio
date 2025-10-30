import React from "react";
import { Link } from "react-router-dom";
import { ShareButton } from "@/components/share";
import "@/styles/blog.css";

export interface BlogPreviewContentProps {
    title: string;
    content: string;
    coverImage?: string | null;
    tags: string[];
    published: boolean;
    author: string;
    readingTime: string;
    viewCount: number;
    publishedAt: string;
    excerpt: string;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const BlogPreviewContent: React.FC<BlogPreviewContentProps> = ({
    title,
    content,
    coverImage,
    tags,
    published,
    author,
    readingTime,
    viewCount,
    publishedAt,
    excerpt,
}) => {
    return (
        <section className="blog">
            <div className="container my-2">
                <div className="row justify-content-center">
                    <div className="entry entry-single col-lg-9">
                        {/* Featured Image */}
                        {coverImage && (
                            <div className="mb-4">
                                <img
                                    src={coverImage}
                                    alt={title}
                                    className="img-fluid entry-img rounded shadow-sm"
                                    style={{
                                        width: "100%",
                                        height: "400px",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        )}

                        {/* Preview Notice */}
                        <div
                            className="alert alert-info d-flex align-items-center mb-3"
                            role="alert"
                        >
                            <i className="bi bi-info-circle me-2"></i>
                            <div>
                                <strong>Preview Mode:</strong> This is how your
                                blog post will appear to readers.
                                {!published && (
                                    <span className="ms-2 badge bg-warning">
                                        <i className="bi bi-eye-slash me-1"></i>
                                        Draft
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Post Header */}
                        <h2 className="entry-title">
                            {title || "Untitled Blog Post"}
                        </h2>
                        <div className="entry-meta">
                            <ul>
                                <li>
                                    <i className="bi bi-person"></i>
                                    <Link to={`#`}>{author}</Link>
                                </li>
                                <li>
                                    <i className="bi bi-calendar"></i>
                                    <Link to={`#`}>
                                        {formatDate(publishedAt)}
                                    </Link>
                                </li>
                                <li>
                                    <i className="bi bi-clock"></i>
                                    <Link
                                        to={`#`}
                                        className="text-decoration-none"
                                    >
                                        {readingTime}
                                    </Link>
                                </li>
                                <li>
                                    <i className="bi bi-eye"></i>
                                    <Link
                                        to={`#`}
                                        className="text-decoration-none"
                                    >
                                        {viewCount === 1
                                            ? `${viewCount} view`
                                            : `${viewCount} views`}
                                    </Link>
                                </li>
                                <li className="d-flex align-items-center">
                                    <ShareButton
                                        url="#"
                                        title={title}
                                        imageUrl={coverImage || undefined}
                                        description={excerpt}
                                        variant="icon"
                                        size="sm"
                                        className="btn-sm special-btn"
                                    />
                                </li>
                            </ul>
                        </div>

                        {/* Post Content */}
                        <div
                            className="mb-3 entry-content"
                            dangerouslySetInnerHTML={{
                                __html:
                                    content ||
                                    '<p class="text-muted">No content provided yet.</p>',
                            }}
                        />

                        {/* Tags and Share */}
                        <div className="entry-footer d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-tags me-2"></i>
                                {tags && tags.length > 0 ? (
                                    <ul className="tags mx-0">
                                        {tags.map((tag, index) => (
                                            <li key={index}>
                                                <Link
                                                    to={`#`}
                                                    className="text-decoration-none me-0"
                                                >
                                                    {tag}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-muted small">
                                        No tags added yet
                                    </span>
                                )}
                            </div>
                            <div className="d-flex align-items-center">
                                <ShareButton
                                    url="#"
                                    title={title}
                                    imageUrl={coverImage || undefined}
                                    description={excerpt}
                                    variant="both"
                                    size="sm"
                                    className="btn-outline-secondary"
                                />
                            </div>
                        </div>

                        {/* Preview Footer */}
                        <div className="mt-4 pt-3 border-top">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-2">
                                        Preview Information
                                    </h6>
                                    <ul className="list-unstyled small text-muted">
                                        <li>
                                            <strong>Status:</strong>{" "}
                                            {published ? "Published" : "Draft"}
                                        </li>
                                        <li>
                                            <strong>Word Count:</strong>{" "}
                                            {
                                                content
                                                    .replace(/<[^>]*>/g, "")
                                                    .split(/\s+/).length
                                            }{" "}
                                            words
                                        </li>
                                        <li>
                                            <strong>Reading Time:</strong>{" "}
                                            {readingTime}
                                        </li>
                                        <li>
                                            <strong>Has Cover Image:</strong>{" "}
                                            {coverImage ? "Yes" : "No"}
                                        </li>
                                        <li>
                                            <strong>Tags Count:</strong>{" "}
                                            {tags.length}
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-2">
                                        SEO Preview
                                    </h6>
                                    <div className="small text-muted">
                                        <div className="mb-1">
                                            <strong>Title:</strong>{" "}
                                            {title || "Untitled Blog Post"}
                                        </div>
                                        <div className="mb-1">
                                            <strong>Description:</strong>{" "}
                                            {excerpt}
                                        </div>
                                        <div>
                                            <strong>URL:</strong> /blog/article/
                                            {title
                                                ?.toLowerCase()
                                                .replace(/\s+/g, "-") ||
                                                "untitled"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
