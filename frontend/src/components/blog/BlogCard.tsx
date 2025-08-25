import { Link } from 'react-router-dom';
import { BlogPost } from '../../hooks/queries/blogQueries';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';

interface BlogCardProps {
  post: BlogPost;
  showExcerpt?: boolean;
}

export function BlogCard({ post, showExcerpt = true }: BlogCardProps) {
  const { canEditProjects: canEditBlog } = useStaffPermissions();

  return (
    <div className="card h-100 shadow-sm">
      {post.featured_image_url && (
        <img
          src={post.featured_image_url}
          className="card-img-top"
          alt={post.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      
      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          {post.tags?.map((tag, index) => (
            <Link
              key={index}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="badge bg-secondary text-decoration-none me-1"
            >
              {tag}
            </Link>
          ))}
        </div>
        
        <h5 className="card-title">
          <Link to={`/blog/${post.slug}`} className="text-decoration-none">
            {post.title}
          </Link>
        </h5>
        
        {showExcerpt && post.excerpt && (
          <p className="card-text flex-grow-1">{post.excerpt}</p>
        )}
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              {new Date(post.date).toLocaleDateString()}
            </small>
            <small className="text-muted">{post.reading_time}</small>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Link
                to={`/blog/${post.slug}`}
                className="btn btn-outline-primary btn-sm"
              >
                Read More
              </Link>
              
              {canEditBlog && (
                <Link
                  to={`/blog/${post.slug}/edit`}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Edit
                </Link>
              )}
            </div>
            
            <div className="text-muted small">
              <span>{post.view_count} views</span>
              {post?.comment_count > 0 && (
                <span className="ms-2">{post?.comment_count} comments</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
