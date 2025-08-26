import { Link } from 'react-router-dom';
import { BlogPost } from '@/hooks/queries/blogQueries';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';

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
          {post.tags_list?.map((tag, index) => (
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
          <Link to={`/blog/article/${post.slug}`} className="text-decoration-none">
            {post.title}
          </Link>
        </h5>
        {showExcerpt && post.excerpt && (
                  <div
                      className="card-text flex-grow-1"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      style={{ lineHeight: '1.8' }}
                  />
        )}
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center text-muted">
              <small className="me-3">
                <i className="bi bi-person me-1"></i>
                {post.author}
              </small>
              <small className="me-3">
                <i className="bi bi-calendar me-1"></i>
                {new Date(post.first_published_at).toLocaleDateString()}
              </small>
              <small>
                <i className="bi bi-clock me-1"></i>
                {post.reading_time}
              </small>
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Link
                to={`/blog/article/${post.slug}`}
                className="btn btn-primary btn-sm"
              >
                Read More
              </Link>
              
              {canEditBlog && (
                <Link
                  to={`/blog/edit/${post.slug}`}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </Link>
              )}
            </div>
            
            <div className="text-muted small">
              <span>{post.view_count} views</span>
              {post?.comments_count > 0 && (
                <span className="ms-2">{post?.comments_count} comments</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
