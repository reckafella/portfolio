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
    choices?: Array<[string, string]>; // For select fields
    accept?: string; // For file inputs
    multiple?: boolean; // For file inputs
    max_size?: number; // For file inputs (in bytes)
}

interface FormConfig {
    fields: Record<string, FieldConfig>;
}

interface UnifiedFormProps {
    formType: 'contact' | 'login' | 'signup' | 'add_project';
    onSubmit: (_formData: Record<string, string | File | File[]>) => Promise<void>;
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
    const [formData, setFormData] = useState<Record<string, string | File | File[]>>({});
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
            case 'add_project':
                return '/api/v1/projects/form-config';
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
                    const initialData: Record<string, string | File | File[]> = {};
                    Object.keys(config.fields).forEach(fieldName => {
                        const fieldConfig = config.fields[fieldName];
                        if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                            initialData[fieldName] = fieldConfig.multiple ? [] : '';
                        } else {
                            initialData[fieldName] = '';
                        }
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
                    
                    const initialData: Record<string, string | File | File[]> = {};
                    Object.keys(fallbackConfig.fields).forEach(fieldName => {
                        const fieldConfig = fallbackConfig.fields[fieldName];
                        if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                            initialData[fieldName] = fieldConfig.multiple ? [] : '';
                        } else {
                            initialData[fieldName] = '';
                        }
                    });
                    setFormData(initialData);
                }
            } catch (_) {
                const noob = () => {} // work around so I can ignore the error
                if (_ instanceof Error) {noob();}
                // Use fallback config on error
                const fallbackConfig = getFallbackConfig();
                setFormConfig(fallbackConfig);
                
                const initialData: Record<string, string | File | File[]> = {};
                Object.keys(fallbackConfig.fields).forEach(fieldName => {
                    const fieldConfig = fallbackConfig.fields[fieldName];
                    if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                        initialData[fieldName] = fieldConfig.multiple ? [] : '';
                    } else {
                        initialData[fieldName] = '';
                    }
                });
                setFormData(initialData);
            } finally {
                setLoading(false);
            }
        };

        fetchFormConfig();
    }, [formType]); // eslint-disable-line

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
            const noob = () => { };
            if (error instanceof Error) noob();
        }
    };

    const handleInputChange = (fieldName: string, value: string | File | File[]) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleFileChange = (fieldName: string, files: FileList | null, multiple: boolean = false) => {
        if (!files) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: multiple ? [] : ''
            }));
            return;
        }

        if (multiple) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: Array.from(files)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [fieldName]: files[0]
            }));
        }
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
        const { required, help_text, disabled, widget, max_length, min_length, choices, accept, multiple, max_size } = fieldConfig;
        const value = formData[fieldName];

        // Common props for text-based inputs
        const textBaseProps = {
            id: fieldName,
            name: fieldName,
            value: typeof value === 'string' ? value : '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
                handleInputChange(fieldName, e.target.value),
            required,
            disabled: disabled || isSubmitting,
            className: "form-control",
            placeholder: help_text,
            maxLength: max_length,
            minLength: min_length
        };

        // Common props for file inputs
        const fileBaseProps = {
            id: fieldName,
            name: fieldName,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleFileChange(fieldName, e.target.files, multiple),
            required,
            disabled: disabled || isSubmitting,
            className: "form-control",
            accept: accept,
            multiple: multiple
        };

        const formatFileSize = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        switch (widget) {
            case 'TextInput':
                return (
                    <input
                        type="text"
                        {...textBaseProps}
                    />
                );
            
            case 'EmailInput':
                return (
                    <input
                        type="email"
                        {...textBaseProps}
                    />
                );

            case 'PasswordInput':
                return (
                    <input
                        type="password"
                        {...textBaseProps}
                    />
                );

            case 'NumberInput':
                return (
                    <input
                        type="number"
                        {...textBaseProps}
                    />
                );

            case 'URLInput':
                return (
                    <input
                        type="url"
                        {...textBaseProps}
                    />
                );
            
            case 'Textarea':
                return (
                    <textarea
                        {...textBaseProps}
                        rows={5}
                        style={{ resize: 'vertical' }}
                    />
                );

            case 'Select':
                return (
                    <select {...textBaseProps}>
                        <option value="">Choose...</option>
                        {choices?.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                );

            case 'FileInput': {
                const fileValue = value as File | File[] | string;
                const selectedFiles = Array.isArray(fileValue) ? fileValue : (fileValue instanceof File ? [fileValue] : []);
                
                return (
                    <div>
                        <input
                            type="file"
                            {...fileBaseProps}
                        />
                        {max_size && (
                            <div className="form-text">
                                Maximum file size: {formatFileSize(max_size)}
                            </div>
                        )}
                        {selectedFiles.length > 0 && (
                            <div className="mt-2">
                                <small className="text-muted">Selected files:</small>
                                <ul className="list-unstyled mt-1">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index} className="small">
                                            <i className="bi bi-file-earmark me-1"></i>
                                            {file.name} ({formatFileSize(file.size)})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            }

            case 'ImageInput': {
                const imageValue = value as File | File[] | string;
                const selectedImages = Array.isArray(imageValue) ? imageValue : (imageValue instanceof File ? [imageValue] : []);
                
                return (
                    <div>
                        <input
                            type="file"
                            {...fileBaseProps}
                            accept={accept || "image/*"}
                        />
                        {max_size && (
                            <div className="form-text">
                                Maximum file size: {formatFileSize(max_size)}
                            </div>
                        )}
                        {selectedImages.length > 0 && (
                            <div className="mt-2">
                                <small className="text-muted">Selected images:</small>
                                <div className="row g-2 mt-1">
                                    {selectedImages.map((file, index) => (
                                        <div key={index} className="col-6 col-md-4">
                                            <div className="card">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="card-img-top"
                                                    style={{ height: '100px', objectFit: 'cover' }}
                                                />
                                                <div className="card-body p-2">
                                                    <small className="text-muted">{file.name}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            
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
                            {...textBaseProps}
                            placeholder="Enter the characters shown above"
                            autoComplete="off"
                        />
                    </div>
                );
            
            default:
                return (
                    <input
                        type="text"
                        {...textBaseProps}
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
