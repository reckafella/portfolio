import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      // Redirect to home page after successful login
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
        <section>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                        <h3 className="card-title text-center mb-4">Sign In</h3>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                            {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='auth-form'>
                            <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                            </div>

                            <div className="mb-4">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                            </div>

                            <button
                            type="submit"
                            className="btn btn-primary w-100 mb-3"
                            disabled={isSubmitting}
                            >
                            {isSubmitting ? (
                                <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-muted mb-0">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-decoration-none">
                                Create one here
                            </Link>
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </section>
  );
};

export default LoginForm;
