import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBlogPost } from '@/hooks/queries/blogQueries';
// import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import UnifiedForm from '@/components/forms/UnifiedForm';

interface BlogPostFormData {
  title: string;
  content: string;
  tags: string;
  published: boolean;
  cover_image?: File;
}

export function BlogAddPage() {
  const navigate = useNavigate();
  const { canCreateProjects: canCreateBlog } = useStaffPermissions();
  const createBlogPostMutation = useCreateBlogPost();
  usePageTitle('Create Blog Post');

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    tags: '',
    published: false
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user doesn't have permission
  if (!canCreateBlog) {
    return (
      <div className="container my-5">
        <AlertMessage 
          type="danger" 
          message="You don't have permission to create blog posts." 
        />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('tags', formData.tags);
      formDataToSubmit.append('published', formData.published.toString());
      
      if (formData.cover_image) {
        formDataToSubmit.append('cover_image', formData.cover_image);
      }

      const newPost = await createBlogPostMutation.mutateAsync(formDataToSubmit);
      
      // Navigate to the new post or blog list
      if (formData.published) {
        navigate(`/blog/${newPost.slug}`);
      } else {
        navigate('/blog');
      }
    } catch (error: unknown) {
      const errorData = error as { status?: number; data?: Record<string, string[]> };
      if (errorData.status === 400 && errorData.data) {
        setErrors(errorData.data);
      } else {
        setErrors({ general: ['Failed to create blog post. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="blog">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="card col-lg-8">
            <div className="card-body">
              <div className="section-title">
                <h2 className="mb-0">Create Blog Post</h2>
              </div>

              {errors.general && errors.general.map((msg, idx) => (
                <AlertMessage key={idx} type="danger" message={msg} />
              ))}

              <UnifiedForm
                formType="create_blog_post"
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onInputChange={handleInputChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                submitButtonText="Create Post"
                loadingText="Creating..."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
