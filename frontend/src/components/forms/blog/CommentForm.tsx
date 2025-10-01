import React from 'react';
import { useCreateBlogComment } from '@/hooks/mutations/useBlogCommentMutation';
import UnifiedForm from '../UnifiedForm';
import { AlertMessage } from '@/components/common/AlertMessage';

interface CommentFormProps {
  postSlug: string;
  onSuccess?: () => void;
  initialData?: Record<string, string | boolean>;
}

const CommentForm: React.FC<CommentFormProps> = ({ postSlug, onSuccess, initialData }) => {
  const createCommentMutation = useCreateBlogComment();

  const handleSubmit = async (formData: Record<string, string | File | File[] | boolean>) => {
    try {
      await createCommentMutation.mutateAsync({
        post_slug: postSlug,
        name: formData.name as string,
        email: formData.email as string,
        website: formData.website as string,
        comment: formData.comment as string,
        captcha_0: formData.captcha_0 as string,
        captcha_1: formData.captcha_1 as string,
      });

      onSuccess?.();
    } catch {
      // Error handling is done by the mutation
    }
  };

  return (
    <div className="comment-form-container mb-4">
      <UnifiedForm
        formType="comment"
        onSubmit={handleSubmit}
        isSubmitting={createCommentMutation.isPending}
        error={createCommentMutation.error?.message}
        success={createCommentMutation.isSuccess}
        submitButtonText="Post Comment"
        loadingText="Posting..."
        title="Leave a Comment"
        initialData={initialData}
      />
      {createCommentMutation.error && (
        <AlertMessage
          type="danger"
          message="Failed to post comment. Please check the form and try again."
          className="mt-3"
        />
      )}
    </div>
  );
};

// export default CommentForm;

export default CommentForm;
