import React, { useState, useEffect } from 'react';
import './ImageUpload.css';
import '../../styles/captcha.css';

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
    formType: 'contact' | 'login' | 'signup' | 'add_project' | 'update_project' | 'create_blog_post' | 'update_blog_post' | 'comment';
    onSubmit: (_formData: Record<string, string | File | File[] | boolean>) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
    success?: boolean;
    title?: string;
    slug?: string;
    submitButtonText?: string;
    loadingText?: string;
    additionalContent?: React.ReactNode;
    containerClassName?: string;
    cardClassName?: string;
    initialData?: Record<string, string | boolean>;
}

const UnifiedForm: React.FC<UnifiedFormProps> = ({ 
    formType,
    onSubmit, 
    isSubmitting, 
    error, 
    success,
    title,
    slug,
    submitButtonText,
    loadingText,
    additionalContent,
    containerClassName: _containerClassName = '',
    cardClassName: _cardClassName = '',
    initialData
}) => {
    const [formData, setFormData] = useState<Record<string, string | File | File[] | boolean>>({});
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [captchaData, setCaptchaData] = useState<{key: string, image: string} | null>(null);
    const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);

    // Determine API endpoint based on form type
    const getApiEndpoint = (slug?: string) => {
        switch (formType) {
            case 'contact':
                return '/api/v1/contact/';
            case 'login':
                return '/api/v1/auth/login/';
            case 'signup':
                return '/api/v1/auth/signup/';
            case 'add_project':
                return '/api/v1/projects/create';
            case 'update_project':
                return `/api/v1/projects/${slug}/update/`;
            case 'create_blog_post':
                return '/api/v1/blog/article/create/';
            case 'update_blog_post':
                return `/api/v1/blog/article/${slug}/update/`;
            default:
                return '/api/v1/contact/';
        }
    };

    // Get fallback configuration for each form type
    const getFallbackConfig = (): FormConfig => {
        switch (formType) {
            case 'comment':
                return {
                    "fields": {
                        "name": {
                            "label": "Name",
                            "type": "TextInput",
                            "required": true,
                            "help_text": "Your name",
                            "disabled": false,
                            "widget": "TextInput",
                            "max_length": 100
                        },
                        "email": {
                            "label": "Email",
                            "type": "EmailInput",
                            "required": true,
                            "help_text": "Your email address (will not be published)",
                            "disabled": false,
                            "widget": "EmailInput",
                            "max_length": 254
                        },
                        "website": {
                            "label": "Website",
                            "type": "URLInput",
                            "required": false,
                            "help_text": "Your website (optional)",
                            "disabled": false,
                            "widget": "URLInput",
                            "max_length": 200
                        },
                        "comment": {
                            "label": "Comment",
                            "type": "Textarea",
                            "required": true,
                            "help_text": "Share your thoughts...",
                            "disabled": false,
                            "widget": "Textarea",
                            "min_length": 10,
                            "max_length": 1000
                        },
                        "captcha": {
                            "label": "CAPTCHA",
                            "type": "CaptchaTextInput",
                            "required": true,
                            "help_text": "Enter the characters shown in the image",
                            "disabled": false,
                            "widget": "CaptchaTextInput"
                        }
                    }
                };
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
                const response = await fetch(getApiEndpoint(slug));
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
                    
                    // Initialize form data with empty values or provided initial data
                    const formInitialData: Record<string, string | File | File[] | boolean> = {};
                    Object.keys(config.fields).forEach(fieldName => {
                        const fieldConfig = config.fields[fieldName];
                        if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                            formInitialData[fieldName] = fieldConfig.multiple ? [] : '';
                        } else if (fieldConfig.widget === 'CheckboxInput') {
                            formInitialData[fieldName] = false;
                        } else {
                            formInitialData[fieldName] = '';
                        }
                        // Pre-fill captcha key
                        if (fieldName === 'captcha' && captchaField?.captcha_key) {
                            formInitialData['captcha_0'] = captchaField.captcha_key;
                        }
                    });
                    
                    // Override with provided initial data
                    if (initialData) {
                        Object.keys(initialData).forEach(key => {
                            if (Object.prototype.hasOwnProperty.call(formInitialData, key)) {
                                formInitialData[key] = initialData[key];
                            }
                        });
                    }
                    
                    setFormData(formInitialData);
                } else {
                    // Use fallback config if endpoint doesn't exist
                    const fallbackConfig = getFallbackConfig();
                    setFormConfig(fallbackConfig);
                    
                    const fallbackInitialData: Record<string, string | File | File[] | boolean> = {};
                    Object.keys(fallbackConfig.fields).forEach(fieldName => {
                        const fieldConfig = fallbackConfig.fields[fieldName];
                        if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                            fallbackInitialData[fieldName] = fieldConfig.multiple ? [] : '';
                        } else if (fieldConfig.widget === 'CheckboxInput') {
                            fallbackInitialData[fieldName] = false;
                        } else {
                            fallbackInitialData[fieldName] = '';
                        }
                    });
                    
                    // Override with provided initial data
                    if (initialData) {
                        Object.keys(initialData).forEach(key => {
                            if (Object.prototype.hasOwnProperty.call(fallbackInitialData, key)) {
                                fallbackInitialData[key] = initialData[key];
                            }
                        });
                    }
                    
                    setFormData(fallbackInitialData);
                }
            } catch (_) {
                const noob = () => {} // work around so I can ignore the error
                if (_ instanceof Error) {noob();}
                // Use fallback config on error
                const fallbackConfig = getFallbackConfig();
                setFormConfig(fallbackConfig);
                
                const errorFallbackData: Record<string, string | File | File[] | boolean> = {};
                Object.keys(fallbackConfig.fields).forEach(fieldName => {
                    const fieldConfig = fallbackConfig.fields[fieldName];
                    if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
                        errorFallbackData[fieldName] = fieldConfig.multiple ? [] : '';
                    } else if (fieldConfig.widget === 'CheckboxInput') {
                        errorFallbackData[fieldName] = false;
                    } else {
                        errorFallbackData[fieldName] = '';
                    }
                });
                
                // Override with provided initial data
                if (initialData) {
                    Object.keys(initialData).forEach(key => {
                        if (Object.prototype.hasOwnProperty.call(errorFallbackData, key)) {
                            errorFallbackData[key] = initialData[key];
                        }
                    });
                }
                
                setFormData(errorFallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchFormConfig();
    }, [formType]); // eslint-disable-line

    const refreshCaptcha = async () => {
        setIsRefreshingCaptcha(true);
        const oldCaptchaKey = captchaData?.key;
        
        try {
            // Send old captcha key for cleanup
            const url = new URL('/api/v1/captcha/refresh', window.location.origin);
            if (oldCaptchaKey) {
                url.searchParams.append('old_key', oldCaptchaKey);
            }
            
            const response = await fetch(url.toString());
            
            if (response.ok) {
                const data = await response.json();
                // Only update captcha if refresh succeeded
                setCaptchaData({
                    key: data.captcha_key,
                    image: data.captcha_image
                });
                // Update form data with new captcha key and clear input
                setFormData(prev => ({
                    ...prev,
                    captcha_0: data.captcha_key,
                    captcha_1: '', // Clear the captcha input field
                    captcha: '' // Also clear if using this field name
                }));
                
                // Also clear the actual input element
                const captchaInput = document.querySelector('input[name="captcha"], input[placeholder*="characters"]') as HTMLInputElement;
                if (captchaInput) {
                    captchaInput.value = '';
                }
            }
        } catch (error) {
            const noob = () => {} // work around so I can ignore the error
            if (error instanceof Error) { noob(); }

        } finally {
            setIsRefreshingCaptcha(false);
        }
    };

    const handleInputChange = (fieldName: string, value: string | boolean | File | File[]) => {
        setFormData(prev => ({...prev, [fieldName]: value}));
    };

    const handleFileChange = (fieldName: string, files: FileList | File[] | null, multiple: boolean = false) => {
        if (!files) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: multiple ? [] : ''
            }));
            return;
        }

        // Convert FileList to Array if needed
        const fileArray = Array.isArray(files) ? files : Array.from(files);

        if (multiple) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: fileArray
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [fieldName]: fileArray[0]
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

        const booleanBaseProps = {
            id: fieldName,
            name: fieldName,
            checked: Boolean(value),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange(fieldName, e.target.checked),
            required,
            disabled: disabled || isSubmitting,
            className: "form-check-input"
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
                    <div className="file-upload-container">
                        {/* Drag and Drop Area */}
                        <div 
                            className="drag-drop-area border-2 border-dashed rounded p-4 text-center"
                            style={{ 
                                borderColor: 'var(--default-color)',
                                backgroundColor: 'var(--card-background-color)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--accent-color)';
                                e.currentTarget.style.backgroundColor = 'var(--card-background-color)';
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--default-color)';
                                e.currentTarget.style.backgroundColor = 'var(--card-background-color)';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--default-color)';
                                e.currentTarget.style.backgroundColor = 'var(--card-background-color)';
                                
                                const files = Array.from(e.dataTransfer.files);
                                if (files.length > 0) {
                                    handleFileChange(fieldName, files, multiple);
                                }
                            }}
                            onClick={() => {
                                const input = document.getElementById(fieldName) as HTMLInputElement;
                                input?.click();
                            }}
                        >
                            <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
                            <p className="mb-1">
                                <strong>Drop files here or click to browse</strong>
                            </p>
                            <p className="small text-muted mb-0">
                                {accept && `Accepts: ${accept}`}
                                {max_size && ` • Max ${formatFileSize(max_size)} per file`}
                                {multiple && ' • Multiple files allowed'}
                            </p>
                        </div>
                        
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            {...fileBaseProps}
                            style={{ display: 'none' }}
                        />
                        
                        {/* File List */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">
                                        <strong>{selectedFiles.length}</strong> file{selectedFiles.length !== 1 ? 's' : ''} selected
                                    </small>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleFileChange(fieldName, null, multiple)}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Clear All
                                    </button>
                                </div>
                                
                                <div className="list-group">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark me-2"></i>
                                                <div>
                                                    <div className="fw-medium">{file.name}</div>
                                                    <small className="text-muted">{formatFileSize(file.size)}</small>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                    onClick={() => {
                                                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                                                        handleFileChange(fieldName, newFiles, multiple);
                                                    }}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            case 'ImageInput': {
                const imageValue = value as File | File[] | string;
                const selectedImages = Array.isArray(imageValue) ? imageValue : (imageValue instanceof File ? [imageValue] : []);
                
                return (
                    <div className="image-upload-container">
                        {/* Drag and Drop Area */}
                        <div 
                            className="drag-drop-area border-2 border-dashed rounded p-4 text-center"
                            style={{ 
                                borderColor: selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--default-color)',
                                backgroundColor: selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--card-background-color)',
                                cursor: selectedImages.length > 5 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: selectedImages.length > 5 ? 0.6 : 1
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (selectedImages.length <= 5) {
                                    e.currentTarget.style.borderColor = 'var(--text-success-color)';
                                    e.currentTarget.style.backgroundColor = 'var(--card-background-color)';
                                }
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--default-color)';
                                e.currentTarget.style.backgroundColor = selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--card-background-color)';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--default-color)';
                                e.currentTarget.style.backgroundColor = selectedImages.length > 5 ? 'var(--text-error-color)' : 'var(--card-background-color)';
                                
                                if (selectedImages.length >= 5) {
                                    alert('You have already reached the maximum of 5 images.');
                                    return;
                                }
                                
                                const files = Array.from(e.dataTransfer.files).filter(file => 
                                    file.type.startsWith('image/')
                                );
                                if (files.length > 0) {
                                    // For multiple images, append to existing files
                                    if (multiple) {
                                        const existingFiles = selectedImages as File[];
                                        const newFiles = [...existingFiles, ...files];
                                        
                                        // Limit to 5 images total
                                        if (newFiles.length > 5) {
                                            alert('You can only upload up to 5 images. Please select fewer images.');
                                            const limitedFiles = newFiles.slice(0, 5);
                                            handleFileChange(fieldName, limitedFiles, multiple);
                                        } else {
                                            handleFileChange(fieldName, newFiles, multiple);
                                        }
                                    } else {
                                        handleFileChange(fieldName, files, multiple);
                                    }
                                }
                            }}
                            onClick={() => {
                                if (selectedImages.length >= 5) {
                                    alert('You have already reached the maximum of 5 images.');
                                    return;
                                }
                                const input = document.getElementById(fieldName) as HTMLInputElement;
                                input?.click();
                            }}
                        >
                            <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
                            <p className="mb-1">
                                <strong>Drop images here or click to browse</strong>
                            </p>
                            <p className="small text-muted mb-0">
                                Supports: JPG, PNG, GIF, WebP, BMP, SVG
                                {max_size && ` • Max ${formatFileSize(max_size)} per file`}
                                {multiple && ' • Up to 5 images allowed'}
                                {selectedImages.length > 0 && ` • ${selectedImages.length}/5 selected`}
                            </p>
                        </div>
                        
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id={fieldName}
                            name={fieldName}
                            accept={accept || "image/*"}
                            multiple={multiple}
                            required={required}
                            disabled={disabled || isSubmitting}
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    if (selectedImages.length >= 5) {
                                        alert('You have already reached the maximum of 5 images.');
                                        e.target.value = ''; // Clear the input
                                        return;
                                    }
                                    
                                    const fileArray = Array.from(files).filter(file => 
                                        file.type.startsWith('image/')
                                    );
                                    
                                    if (multiple) {
                                        // For multiple images, append to existing files
                                        const existingFiles = selectedImages as File[];
                                        const newFiles = [...existingFiles, ...fileArray];
                                        
                                        // Limit to 5 images total
                                        if (newFiles.length > 5) {
                                            alert('You can only upload up to 5 images. Please select fewer images.');
                                            const limitedFiles = newFiles.slice(0, 5);
                                            handleFileChange(fieldName, limitedFiles, multiple);
                                        } else {
                                            handleFileChange(fieldName, newFiles, multiple);
                                        }
                                    } else {
                                        handleFileChange(fieldName, fileArray, multiple);
                                    }
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                        
                        {/* Image Previews */}
                        {selectedImages.length > 0 && (
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">
                                        <strong>{selectedImages.length}</strong> image{selectedImages.length !== 1 ? 's' : ''} selected
                                    </small>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleFileChange(fieldName, null, multiple)}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Clear All
                                    </button>
                                </div>
                                
                                <div className="row g-2">
                                    {selectedImages.map((file, index) => (
                                        <div key={index} className="col-6 col-md-4 col-lg-3">
                                            <div className="card position-relative">
                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                    style={{ 
                                                        borderRadius: '50%', 
                                                        width: '24px', 
                                                        height: '24px', 
                                                        padding: '0',
                                                        zIndex: 10
                                                    }}
                                                    onClick={() => {
                                                        const newFiles = selectedImages.filter((_, i) => i !== index);
                                                        handleFileChange(fieldName, newFiles, multiple);
                                                    }}
                                                >
                                                    <i className="bi bi-x-lg" style={{ fontSize: '10px' }}></i>
                                                </button>
                                                
                                                {/* Image Preview */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="card-img-top"
                                                    style={{ 
                                                        height: '120px', 
                                                        objectFit: 'cover',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => {
                                                        // Create and show lightbox modal
                                                        const modal = document.createElement('div');
                                                        modal.className = 'modal fade';
                                                        modal.innerHTML = `
                                                            <div class="modal-dialog modal-lg modal-dialog-centered">
                                                                <div class="modal-content">
                                                                    <div class="modal-header">
                                                                        <h5 class="modal-title">${file.name}</h5>
                                                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                                    </div>
                                                                    <div class="modal-body text-center">
                                                                        <img src="${URL.createObjectURL(file)}" class="img-fluid" style="max-height: 70vh;">
                                                                        <p class="mt-2 text-muted">${formatFileSize(file.size)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        `;
                                                        document.body.appendChild(modal);
                                                        
                                                        // Show modal using Bootstrap
                                                        const bootstrapModal = new (window as unknown as { bootstrap: { Modal: new (_modal: HTMLElement) => { show: () => void } } }).bootstrap.Modal(modal);
                                                        bootstrapModal.show();
                                                        
                                                        // Clean up modal after it's hidden
                                                        modal.addEventListener('hidden.bs.modal', () => {
                                                            document.body.removeChild(modal);
                                                        });
                                                    }}
                                                />
                                                
                                                {/* File Info */}
                                                <div className="card-body p-2">
                                                    <small className="card-text text-truncate d-block" title={file.name}>
                                                        {file.name}
                                                    </small>
                                                    <small className="text-muted">{formatFileSize(file.size)}</small>
                                                    
                                                    {/* File Size Progress Bar */}
                                                    <div className="mt-1">
                                                        <div className="progress" style={{ height: '4px' }}>
                                                            <div 
                                                                className={`progress-bar ${file.size > (max_size || 5 * 1024 * 1024) ? 'bg-danger' : 'bg-success'}`}
                                                                role="progressbar" 
                                                                style={{ width: '100%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
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
                                        style={{ 
                                            height: '50px',
                                            opacity: isRefreshingCaptcha ? 0.5 : 1,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                        onError={(_e) => {
                                            refreshCaptcha();
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            refreshCaptcha();
                                        }}
                                        disabled={isSubmitting || isRefreshingCaptcha}
                                        title="Refresh CAPTCHA"
                                    >
                                        <i 
                                            className={`bi bi-arrow-clockwise ${isRefreshingCaptcha ? 'captcha-refresh-spin' : ''}`}
                                        ></i>
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
                                        disabled={isRefreshingCaptcha}
                                    >
                                        {isRefreshingCaptcha ? 'Loading...' : 'Try again'}
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
            
            case 'CheckboxInput':
                return (
                    <div className="form-check">
                        <input
                            type="checkbox"
                            role='switch'
                            {...booleanBaseProps}
                        />
                        <label htmlFor={fieldName} className="form-check-label ms-2">
                            {fieldConfig.label || fieldConfig.help_text || 'Enable this option'}
                        </label>
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

    const getFieldLayoutClass = (fieldName: string, _fieldConfig: FieldConfig) => {
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
                <div className="spinner-grow spinner-grow-sm text-danger" role="status">
                    <span className="visually-hidden">Loading form...</span>
                </div>
                <div className="spinner-grow text-info" role="status" style={{ height: '2rem', width: '2rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow spinner-grow-lg text-success" role="status" style={{ height: '3rem', width: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
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
            <div className="section-title  mb-0">
            {title && (
                <h2 className="fw-bold">
                    {title}
                </h2>
            )}</div>

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

            <form onSubmit={handleSubmit} method="POST">
                <div className="row g-3">
                    {Object.entries(formConfig.fields).map(([fieldName, fieldConfig]) => (
                        <div key={fieldName} className={getFieldLayoutClass(fieldName, fieldConfig)}>
                            {fieldConfig.widget !== 'CheckboxInput' && (
                            <label htmlFor={fieldName} className="form-label fw-medium">
                                {fieldConfig.label}
                                {fieldConfig.required && <span className="text-danger ms-1">*</span>}
                            </label>
                            )}
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
                                <div className="spinner-grow text-info">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                {loadingText || 'Processing...'}
                            </div>
                        ) : (
                            submitButtonText || 'Submit'
                        )}
                    </button>
                </div>
                <div className="text-center mt-3">
                    {additionalContent}
                </div>
            </form>
        </div>
    );
};

export default UnifiedForm;
