import { Link } from "react-router-dom";
import { BlogPost } from "@/hooks/queries/blogQueries";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { ShareButton } from "../share/ShareButton";

interface BlogCardProps {
    post: BlogPost;
    showExcerpt?: boolean;
}

export function BlogCard({ post, showExcerpt = true }: BlogCardProps) {
    const { canEditProjects: canEditBlog } = useStaffPermissions();
    const justifyClass = canEditBlog
        ? "justify-content-around"
        : "justify-content-center";
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    return (
        <article className="entry col-12">
            {post.featured_image_url ? (
                <div className="entry-img my-2">
                    <img
                        src={post.featured_image_url}
                        className="img-fluid"
                        alt={`Cover Image for the article: ${post.title}`}
                        style={{
                            maxHeight: "350px",
                            width: "100%",
                            objectFit: "cover",
                        }}
                        loading="lazy"
                    />
                </div>
            ) : (
                <div
                    className="bg-light-dark d-flex align-items-center justify-content-center"
                    style={{ height: "300px", maxHeight: "350px" }}
                >
                    <div className="d-flex flex-column justify-content-between align-items-center">
                        <i
                            className="bi bi-image text-muted"
                            style={{ fontSize: "3rem" }}
                        ></i>
                        <span className="text-muted text-center">
                            No image available
                        </span>
                    </div>
                </div>
            )}

            <div className="entry-meta">
                <ul className="d-flex justify-content-start justify-content-md-start">
                    <li className="d-flex align-items-center">
                        <i className="bi bi-person me-1"></i>
                        <span>{post.author}</span>
                    </li>
                    <li className="d-flex align-items-center">
                        <i className="bi bi-calendar me-1"></i>
                        <span>{formatDate(post.first_published_at)}</span>
                    </li>
                    <li className="d-none d-lg-flex align-items-center">
                        <i className="bi bi-clock me-1"></i>
                        <span>{post.reading_time}</span>
                    </li>
                    <li className="d-flex align-items-center">
                        <ShareButton
                            url={`${window.location.origin}/blog/article/${post?.slug}`}
                            title={post.title}
                            imageUrl={
                                post.featured_image_url || post.cover_image_url
                            }
                            description={post.excerpt}
                            variant="icon"
                            size="sm"
                            className="btn-sm special-btn"
                        />
                    </li>
                </ul>
            </div>
            <h2 className="entry-title my-2 my-lg-3">
                <Link
                    to={`/blog/article/${post.slug}`}
                    className="text-decoration-none"
                >
                    {post.title}
                </Link>
            </h2>

            {showExcerpt && post.excerpt && (
                <div
                    className="entry-content flex-grow-1"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    style={{ lineHeight: "1.3" }}
                />
            )}

            <div className={`d-flex ${justifyClass} gap-2`}>
                <Link
                    to={`/blog/article/${post.slug}`}
                    className="btn btn-success btn-sm"
                >
                    Read Article <i className="bi bi-arrow-right"></i>
                </Link>

                {canEditBlog && (
                    <Link
                        to={`/blog/edit/${post.slug}`}
                        className="btn btn-secondary btn-sm"
                    >
                        <i className="bi bi-pen"></i> Edit Article
                    </Link>
                )}
            </div>
        </article>
    );
}
