import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UnifiedForm from '@/components/forms/UnifiedForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSignup } from '@/hooks/queries/authQueries';
import { usePreloader } from '@/hooks/usePreloader';
import { getSafeNextUrl } from '@/utils/authUtils';

const SignupForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  usePageTitle('Sign Up');
  const signupMutation = useSignup();
  const { showLoader, hideLoader } = usePreloader();

  const handleSubmit = async (formData: Record<string, string | File | File[]>) => {
    showLoader(); // Show global preloader during registration

    try {
      await signupMutation.mutateAsync({
        username: formData.username as string,
        email: formData.email as string,
        password: formData.password as string,
        password_confirm: formData.password_confirm as string,
        first_name: formData.first_name as string,
        last_name: formData.last_name as string,
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
    <section className='section'>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <UnifiedForm
                  formType="signup"
                  onSubmit={handleSubmit}
                  isSubmitting={signupMutation.isPending}
                  error={signupMutation.error?.message}
                  title="Sign Up"
                  submitButtonText="Sign Up"
                  loadingText="Creating Account..."
                  additionalContent={
                    <div className="text-center">
                      <p className="text-muted">
                        Already have an account?{' '}
                        <Link 
                          to={`/login${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : ''}`} 
                          className="text-decoration-none"
                        >
                          Sign In
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

export default SignupForm;
