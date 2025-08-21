import React, { useState, useEffect } from 'react';

interface FieldConfig {
    label: string;
    type: string;
    required: boolean;
    help_text: string;
    disabled: boolean;
    widget: string;
    max_length?: number;
    min_length?: number;
    captcha_key?: string;
    captcha_image?: string;
}

interface FormConfig {
    fields: Record<string, FieldConfig>;
}

interface UnifiedFormProps {
    formType: 'contact' | 'login' | 'signup';
    onSubmit: (_formData: Record<string, string>) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
    success?: boolean;
    title?: string;
    submitButtonText?: string;
    loadingText?: string;
    additionalContent?: React.ReactNode;
    containerClassName?: string;
    cardClassName?: string;
}

const UnifiedForm: React.FC<UnifiedFormProps> = ({ 
    formType,
    onSubmit, 
    isSubmitting, 
    error, 
    success,
    title,
    submitButtonText,
    loadingText,
    additionalContent,
    containerClassName: _containerClassName = '',
    cardClassName: _cardClassName = ''
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [captchaData, setCaptchaData] = useState<{key: string, image: string} | null>(null);

    // Determine API endpoint based on form type
    const getApiEndpoint = () => {
        switch (formType) {
            case 'contact':
                return '/api/v1/contact';
            case 'login':
                return '/api/v1/auth/login-form-config';
            case 'signup':
                return '/api/v1/auth/signup-form-config';
            default:
                return '/api/v1/contact';
        }
    };

    // Get fallback configuration for each form type
    const getFallbackConfig = (): FormConfig => {
        switch (formType) {
            case 'login':
                return {
                    "fields": {
                        "username": {
                            "label": "Username",
                            "type": "TextInput",
                            "required": true,
                            "help_text": "Enter your username",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 150
                        },
                        "password": {
                            "label": "Password",
                            "type": "PasswordInput",
                            "required": true,
                            "help_text": "Enter your password",
                            "disabled": false,
                            "widget": "PasswordInput"
                        }
                    }
                };
            case 'signup':
                return {
                    "fields": {
                        "first_name": {
                            "label": "First Name",
                            "type": "TextInput",
                            "required": false,
                            "help_text": "Your first name",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 30
                        },
                        "last_name": {
                            "label": "Last Name",
                            "type": "TextInput",
                            "required": false,
                            "help_text": "Your last name",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 30
                        },
                        "username": {
                            "label": "Username",
                            "type": "TextInput",
                            "required": true,
                            "help_text": "Choose a unique username",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 150
                        },
                        "email": {
                            "label": "Email Address",
                            "type": "EmailInput",
                            "required": true,
                            "help_text": "Enter a valid email address",
                            "disabled": false,
                            "widget": "EmailInput",
                            "max_length": 254
                        },
                        "password": {
                            "label": "Password",
                            "type": "PasswordInput",
                            "required": true,
                            "help_text": "Password must be at least 8 characters",
                            "disabled": false,
                            "widget": "PasswordInput",
                            "min_length": 8
                        },
                        "password_confirm": {
                            "label": "Confirm Password",
                            "type": "PasswordInput",
                            "required": true,
                            "help_text": "Enter your password again",
                            "disabled": false,
                            "widget": "PasswordInput"
                        }
                    }
                };
            default: // contact
                return {
                    "fields": {
                        "name": {
                            "label": "Name",
                            "type": "TextInput",
                            "required": true,
                            "help_text": "Your full name",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 50
                        },
                        "email": {
                            "label": "Email",
                            "type": "EmailInput",
                            "required": true,
                            "help_text": "Enter a valid email address",
                            "disabled": false,
                            "widget": "EmailInput",
                            "max_length": 70
                        },
                        "subject": {
                            "label": "Subject",
                            "type": "TextInput",
                            "required": true,
                            "help_text": "What's this about?",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 150
                        },
                        "message": {
                            "label": "Message",
                            "type": "Textarea",
                            "required": true,
                            "help_text": "Tell me about your project or just say hello...",
                            "disabled": false,
                            "widget": "Textarea",
                            "max_length": 1000
                        }
                    }
                };
        }
    };

    // Fetch form configuration from backend
    useEffect(() => {
        const fetchFormConfig = async () => {
            try {
                const response = await fetch(getApiEndpoint());
                if (response.ok) {
                    const config = await response.json();
                    setFormConfig(config);
                    
                    // Extract CAPTCHA data if present (for contact form)
                    const captchaField = config.fields?.captcha;
                    if (captchaField && captchaField.captcha_key && captchaField.captcha_image) {
                        setCaptchaData({
                            key: captchaField.captcha_key,
                            image: captchaField.captcha_image
                        });
                    }
                    
                    // Initialize form data with empty values
                    const initialData: Record<string, string> = {};
                    Object.keys(config.fields).forEach(fieldName => {
                        initialData[fieldName] = '';
                        // Pre-fill captcha key
                        if (fieldName === 'captcha' && captchaField?.captcha_key) {
                            initialData['captcha_0'] = captchaField.captcha_key;
                        }
                    });
                    setFormData(initialData);
                } else {
                    // Use fallback config if endpoint doesn't exist
                    const fallbackConfig = getFallbackConfig();
                    setFormConfig(fallbackConfig);
                    
                    const initialData: Record<string, string> = {};
                    Object.keys(fallbackConfig.fields).forEach(fieldName => {
                        initialData[fieldName] = '';
                    });
                    setFormData(initialData);
                }
            } catch (_) {
                const noob = () => {} // work around so I can ignore the error
                if (_ instanceof Error) {noob();}
                // Use fallback config on error
                const fallbackConfig = getFallbackConfig();
                setFormConfig(fallbackConfig);
                
                const initialData: Record<string, string> = {};
                Object.keys(fallbackConfig.fields).forEach(fieldName => {
                    initialData[fieldName] = '';
                });
                setFormData(initialData);
            } finally {
                setLoading(false);
            }
        };

        fetchFormConfig();
    }, [formType]);

    const refreshCaptcha = async () => {
        try {
            const response = await fetch('/api/v1/captcha/refresh');
            if (response.ok) {
                const data = await response.json();
                setCaptchaData({
                    key: data.captcha_key,
                    image: data.captcha_image
                });
                // Update form data with new captcha key
                setFormData(prev => ({
                    ...prev,
                    captcha_0: data.captcha_key,
                    captcha: '' // Clear the captcha input
                }));
            }
        } catch (error) {
            console.error('Failed to refresh CAPTCHA:', error);
        }
    };

    const handleInputChange = (fieldName: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare form data for submission
        const submitData = { ...formData };
        
        // Handle CAPTCHA field specially for contact forms
        if (formType === 'contact' && captchaData && formData.captcha) {
            submitData.captcha_0 = captchaData.key;
            submitData.captcha_1 = formData.captcha;
            delete submitData.captcha; // Remove the original captcha field
        }
        
        await onSubmit(submitData);
    };

    const renderField = (fieldName: string, fieldConfig: FieldConfig) => {
        const { required, help_text, disabled, widget, max_length, min_length } = fieldConfig;
        const value = formData[fieldName] || '';

        const baseProps = {
            id: fieldName,
            name: fieldName,
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                handleInputChange(fieldName, e.target.value),
            required,
            disabled: disabled || isSubmitting,
            className: "form-control",
            placeholder: help_text,
            maxLength: max_length,
            minLength: min_length
        };

        switch (widget) {
            case 'TextInput':
                return (
                    <input
                        type="text"
                        {...baseProps}
                    />
                );
            
            case 'EmailInput':
                return (
                    <input
                        type="email"
                        {...baseProps}
                    />
                );

            case 'PasswordInput':
                return (
                    <input
                        type="password"
                        {...baseProps}
                    />
                );
            
            case 'Textarea':
                return (
                    <textarea
                        {...baseProps}
                        rows={5}
                        style={{ resize: 'vertical' }}
                    />
                );
            
            case 'CaptchaTextInput':
                return (
                    <div>
                        {captchaData ? (
                            <div className="captcha-container mb-3">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <img 
                                        src={captchaData.image} 
                                        alt="CAPTCHA" 
                                        className="border rounded"
                                        style={{ height: '50px' }}
                                        onError={(_e) => {
                                            refreshCaptcha();
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={refreshCaptcha}
                                        disabled={isSubmitting}
                                        title="Refresh CAPTCHA"
                                    >
                                        <i className="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-warning mb-3">
                                <small>
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    CAPTCHA failed to load. 
                                    <button 
                                        type="button" 
                                        className="btn btn-link btn-sm p-0 ms-1" 
                                        onClick={refreshCaptcha}
                                    >
                                        Try again
                                    </button>
                                </small>
                            </div>
                        )}
                        <input
                            type="text"
                            {...baseProps}
                            placeholder="Enter the characters shown above"
                            autoComplete="off"
                        />
                    </div>
                );
            
            default:
                return (
                    <input
                        type="text"
                        {...baseProps}
                    />
                );
        }
    };

    const getFieldLayoutClass = (fieldName: string) => {
        // Special layout rules based on field name and form type
        if (fieldName === 'message' || fieldName === 'captcha') {
            return 'col-12 mb-3';
        }
        
        // For auth forms, stack most fields
        if (formType === 'login') {
            return 'col-12 mb-3';
        }

        // For signup, name fields side by side
        if ((formType === 'signup') && 
            (fieldName === 'first_name' || fieldName === 'last_name')) {
            return 'col-md-6 mb-3';
        }

        // For contact form, name and email side by side
        if (formType === 'contact' && (fieldName === 'name' || fieldName === 'email')) {
            return 'col-md-6 mb-3';
        }
        
        // Default to full width
        return 'col-12 mb-3';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading form...</span>
                </div>
            </div>
        );
    }

    if (!formConfig) {
        return (
            <div className="alert alert-danger" role="alert">
                Failed to load {formType} form. Please try again later.
            </div>
        );
    }

    return (
        <div className="rounded-3 shadow p-4">
            {title && (
                <h2 className="h3 fw-bold mb-4">
                    {title}
                </h2>
            )}

            {success && (
                <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {formType === 'contact' && 'Message sent successfully! I\'ll get back to you soon.'}
                    {formType === 'login' && 'Login successful! Redirecting...'}
                    {formType === 'signup' && 'Account created successfully! Welcome!'}
                </div>
            )}

            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {additionalContent}

            <form onSubmit={handleSubmit} method="POST">
                <div className="row g-3">
                    {Object.entries(formConfig.fields).map(([fieldName, fieldConfig]) => (
                        <div key={fieldName} className={getFieldLayoutClass(fieldName)}>
                            <label htmlFor={fieldName} className="form-label fw-medium">
                                {fieldConfig.label}
                                {fieldConfig.required && <span className="text-danger ms-1">*</span>}
                            </label>
                            {renderField(fieldName, fieldConfig)}
                        </div>
                    ))}
                </div>
                
                <div className="col-12 text-center mt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`btn btn-lg w-50 py-2 ${isSubmitting ? 'btn-secondary' : 'btn-primary'}`}
                    >
                        {isSubmitting ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                {loadingText || 'Processing...'}
                            </div>
                        ) : (
                            submitButtonText || 'Submit'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UnifiedForm;
