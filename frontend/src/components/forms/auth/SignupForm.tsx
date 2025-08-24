import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UnifiedForm from '../UnifiedForm';
import { useSignup } from '../../../hooks/queries/authQueries';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const handleSubmit = async (formData: Record<string, string>) => {
    await signupMutation.mutateAsync({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password_confirm,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });
    
    // Redirect to home page after successful registration
    navigate('/');
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
