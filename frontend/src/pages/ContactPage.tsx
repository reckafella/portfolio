import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
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
                            {/* Contact Form */}
                            <div className="rounded-3 shadow p-4">
                                <h2 className="h3 fw-bold mb-4">
                                    Send a Message
                                </h2>

                                {submitStatus === 'success' && (
                                <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                    Message sent successfully! I'll get back to you soon.
                                </div>
                                )}

                                {submitStatus === 'error' && (
                                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                    Failed to send message. Please try again.
                                </div>
                                )}

                                <form onSubmit={handleSubmit} method='POST'>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="name" className="form-label fw-medium">
                                                Name *
                                            </label>
                                            <input
                                                type="text" id="name" name="name" value={formData.name}
                                                onChange={handleInputChange} required className="form-control"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label htmlFor="email" className="form-label fw-medium">
                                                Email *
                                            </label>
                                            <input type="email" id="email" name="email" value={formData.email}
                                                onChange={handleInputChange} required className="form-control"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="subject" className="form-label fw-medium">
                                            Subject *
                                        </label>
                                        <input
                                            type="text" id="subject" name="subject" value={formData.subject}
                                            onChange={handleInputChange} required className="form-control"
                                            placeholder="What's this about?"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="message" className="form-label fw-medium">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message" name="message" value={formData.message}
                                            onChange={handleInputChange} required rows={5}
                                            className="form-control"
                                            placeholder="Tell me about your project or just say hello..."
                                        />
                                    </div>
                                    <div className="col-12 text-center mt-4">
                                        <button type="submit" disabled={isSubmitting}
                                        className={`btn btn-sm btn-lg justify-content-center w-50 py-2 ${isSubmitting ? 'btn-secondary' : 'btn-primary'}`}>
                                        {isSubmitting ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Sending...
                                            </div>
                                        ) : (
                                            'Send Message'
                                        )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;
