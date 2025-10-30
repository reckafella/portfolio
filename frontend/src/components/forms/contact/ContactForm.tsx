import React from "react";
import UnifiedForm from "@/components/forms/UnifiedForm";

interface ContactFormProps {
    onSubmit: (
        _formData: Record<string, string | boolean | File | File[]>,
    ) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
    success?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
    onSubmit,
    isSubmitting,
    error,
    success,
}) => {
    return (
        <UnifiedForm
            formType="contact"
            onSubmit={onSubmit}
            slug="contact"
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
