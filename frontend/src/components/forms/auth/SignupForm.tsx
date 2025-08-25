import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UnifiedForm from '../UnifiedForm';
import { useSignup } from '../../../hooks/queries/authQueries';
import { usePreloader } from '../../../hooks/usePreloader';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const signupMutation = useSignup();
  const { showLoader, hideLoader } = usePreloader();

  const handleSubmit = async (formData: Record<string, string>) => {
    showLoader(); // Show global preloader during registration

    try {
      await signupMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // Keep loader visible briefly to show success state
      setTimeout(() => {
        hideLoader();
        // Redirect to home page after successful registration
        navigate('/');
      }, 500);
    } catch (error) {
      hideLoader(); // Hide loader on error
      throw error; // Re-throw to let UnifiedForm handle the error display
    }
  };

  return (
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
                      <Link to="/login" className="text-decoration-none">
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
  );
};

export default SignupForm;
