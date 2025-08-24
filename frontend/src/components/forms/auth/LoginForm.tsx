import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UnifiedForm from '../UnifiedForm';
import { useLogin } from '../../../hooks/queries/authQueries';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (formData: Record<string, string>) => {
    await loginMutation.mutateAsync({
      username: formData.username,
      password: formData.password,
    });
    
    // Redirect to home page after successful login
    navigate('/');
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
                        <Link to="/signup" className="text-decoration-none">
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
