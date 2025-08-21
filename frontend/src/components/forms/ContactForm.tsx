import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'


const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/v1/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            //navigate('/');
        } catch (err: any) {
            setError(err.message || err.toString() || 'Error Sending message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className='contact'>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-9">
                        <div className="card shadow">
                            <div className="card-body p-4">
                                <h3 className="card-title text-center mb-4">Sign In</h3>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className='contact-form'>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="subject" className="form-label">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="message" className="form-label">
                                            Message
                                        </label>
                                        <textarea
                                            rows={4}
                                            style={{ resize: 'both'}}
                                            className="form-control"
                                            id="message"
                                            value={message}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mb-3"
                                        disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending Message...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactForm;
