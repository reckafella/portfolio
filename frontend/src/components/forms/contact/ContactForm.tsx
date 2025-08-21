import React from 'react';
import UnifiedForm from '../UnifiedForm';

interface ContactFormProps {
    onSubmit: (formData: Record<string, string>) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
    success?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
    onSubmit, 
    isSubmitting, 
    error, 
    success 
}) => {
    return (
        <UnifiedForm
            formType="contact"
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            error={error}
            success={success}
            title="Send a Message"
            submitButtonText="Send Message"
            loadingText="Sending..."
        />
    );
};

export default ContactForm;
