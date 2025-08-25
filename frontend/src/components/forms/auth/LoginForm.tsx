import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UnifiedForm from '../UnifiedForm';
import { useLogin } from '../../../hooks/queries/authQueries';
import { usePreloader } from '../../../hooks/usePreloader';
import { getSafeNextUrl } from '../../../utils/authUtils';

const LoginForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();
  const { showLoader, hideLoader } = usePreloader();

  const handleSubmit = async (formData: Record<string, string | File | File[]>) => {
    showLoader(); // Show global preloader during authentication

    try {
      await loginMutation.mutateAsync({
        username: formData.username as string,
        password: formData.password as string,
      });

      // Keep loader visible briefly to show success state
      setTimeout(() => {
        hideLoader();
        
        // Get the next parameter or default to home page, ensuring it's safe
        const nextUrl = getSafeNextUrl(searchParams.get('next'));
        
        // Force a full page reload to ensure all authentication state is properly updated
        window.location.href = nextUrl;
      }, 500);
    } catch (error) {
      hideLoader(); // Hide loader on error
      throw error; // Re-throw to let UnifiedForm handle the error display
    }
  };

  return (
    <section>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <UnifiedForm
                  formType="login"
                  onSubmit={handleSubmit}
                  isSubmitting={loginMutation.isPending}
                  error={loginMutation.error?.message}
                  title="Sign In"
                  submitButtonText="Sign In"
                  loadingText="Signing in..."
                  additionalContent={
                    <div className="text-center">
                      <p className="text-muted mb-0">
                        Don't have an account?{' '}
                        <Link 
                          to={`/auth/signup${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : ''}`} 
                          className="text-decoration-none"
                        >
                          Create one here
                        </Link>
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
