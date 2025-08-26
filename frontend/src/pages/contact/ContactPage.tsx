import React from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/forms/contact/ContactForm';
import { useSendMessage } from '@/hooks/queries/contactQueries';
import { usePageTitle } from '@/hooks/usePageTitle';

const ContactPage: React.FC = () => {
    usePageTitle('Contact');

    const sendMessageMutation = useSendMessage();

    const handleSubmit = async (formData: Record<string, string>) => {
        await sendMessageMutation.mutateAsync(formData);
    };

    return (
        <section id="contact" className="section contact py-3">
            <div className="container">
                <div className="info-wrap card col-12 col-md-11 col-lg-10 mx-auto">
                    <div className="text-center">
                        <div className="section-title">
                            <h2 className="h4">Contact Me</h2>
                        </div>

                        <p className="lead mx-auto" style={{ maxWidth: '42rem' }}>
                            Have a project in mind or just want to say hello? I'd love to hear from you.
                            Let's discuss how we can work together.
                        </p>
                    </div>
                    <div className="row justify-content-around d-flex gy-3">
                        <Link className="col-2 col-md-6 col-lg-3 col-xl-3" to="https://www.linkedin.com/in/ethanmuthoni" target="_blank">
                            <div className="info-item d-flex linkedin">
                                <i className="bi bi-linkedin"></i>
                                <div className="d-none d-md-block">
                                    <h3>LinkedIn</h3>
                                    <p>Ethan Muthoni</p>
                                </div>
                            </div>
                        </Link>
                        <Link className="col-2 col-md-6 col-lg-3 col-xl-3" to="https://github.com/reckafella" target="_blank">
                            <div className="info-item d-flex github">
                                <i className="bi bi-github"></i>
                                <div className="d-none d-md-block">
                                    <h3>GitHub</h3>
                                    <p>reckafella</p>
                                </div>
                            </div>
                        </Link>
                        <Link className="col-2 col-md-6 col-lg-3 col-xl-3" to="mailto:ethanwanyoike@gmail.com" target="_blank">
                            <div className="info-item d-flex email">
                                <i className="bi bi-envelope"></i>
                                <div className="d-none d-md-block">
                                    <h3>Email</h3>
                                    <p>ethanwanyoike</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <hr className="my-5" />
                    <div className="card-body">
                        <div className="col-12 col-md-10 mx-auto">
                            <ContactForm 
                                onSubmit={handleSubmit}
                                isSubmitting={sendMessageMutation.isPending}
                                error={sendMessageMutation.error?.message}
                                success={sendMessageMutation.isSuccess}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;
