import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '../../components/forms/contact/ContactForm';

const ContactPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (_formData: Record<string, string>) => {
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section contact py-3">
            <div className="container">
                <div className="info-wrap card col-12 col-md-11 col-lg-10 mx-auto">
                    <div className="text-center">
                        <h1 className="display-4 fw-bold mb-4">
                            Get In Touch
                        </h1>
                        <p className="lead mx-auto" style={{ maxWidth: '42rem' }}>
                            Have a project in mind or just want to say hello? I'd love to hear from you.
                            Let's discuss how we can work together.
                        </p>
                    </div>
                    <div className="row justify-content-around d-flex gy-3">
                        <Link className="col-2 col-md-6 col-lg-3 col-xl-3" to="https://x.com/frmundu" target="_blank">
                            <div className="info-item d-flex phone">
                                <i className="bi bi-telephone"></i>
                                <div className="d-none d-md-block">
                                    <h3>Twitter</h3>
                                    <p>Ethan Wanyoike</p>
                                </div>
                            </div>
                        </Link>
                        <Link className="col-2 col-md-6 col-lg-3 col-xl-3" to="https://www.linkedin.com/in/ethanmuthoni" target="_blank">
                            <div className="info-item d-flex linkedin">
                                <i className="bi bi-linkedin"></i>
                                <div className="d-none d-md-block">
                                    <h3>LinkedIn</h3>
                                    <p>Ethan Wanyoike</p>
                                </div>
                            </div>
                        </Link>
                        <div className="col-2 col-md-6 col-lg-4 col-xl-3">
                            <Link to="mailto:ethanmuthoni@gmail.com" target="_blank" className="info-item d-flex email">
                                <i className="bi bi-envelope-paper-fill py-1 px-2"></i>
                                <div className="d-none d-md-block">
                                    <h3>Email Me</h3>
                                    <p>ethanmuthoni@gmail.com</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card col-12 col-md-11 col-lg-10 mx-auto mt-4 p-4">
                    <div className="row">
                        <div className="card-body">
                            <ContactForm
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                error={error}
                                success={success}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;
