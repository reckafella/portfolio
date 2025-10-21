import { FormValue, FormConfig, FieldConfig } from "@/types/unifiedForms";

export const getApiEndpoint = (formType: string, slug?: string): string => {
    const endpoints: Record<string, string> = {
        contact: '/api/v1/contact/',
        login: '/api/v1/auth/login/',
        signup: '/api/v1/auth/signup/',
        create_project: '/api/v1/projects/create/',
        update_project: `/api/v1/projects/${slug}/update/`,
        create_article: '/api/v1/blog/article/create/',
        update_article: `/api/v1/blog/article/${slug}/update/`,
    };
    
    return endpoints[formType] || '/api/v1/contact/';
};

export const fetchFormConfig = async (endpoint: string): Promise<FormConfig> => {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error('Failed to fetch form configuration');
    }
    return response.json();
};

export const getFallbackFormConfig = (formType: string): FormConfig => {
    const configs: Record<string, FormConfig> = {
        comment: {
            fields: {
                name: {
                    label: "Name",
                    type: "TextInput",
                    required: true,
                    help_text: "Your name",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 100
                },
                email: {
                    label: "Email",
                    type: "EmailInput",
                    required: true,
                    help_text: "Your email address (will not be published)",
                    disabled: false,
                    widget: "EmailInput",
                    max_length: 254
                },
                website: {
                    label: "Website",
                    type: "URLInput",
                    required: false,
                    help_text: "Your website (optional)",
                    disabled: false,
                    widget: "URLInput",
                    max_length: 200
                },
                comment: {
                    label: "Comment",
                    type: "Textarea",
                    required: true,
                    help_text: "Share your thoughts...",
                    disabled: false,
                    widget: "Textarea",
                    min_length: 10,
                    max_length: 1000
                },
                captcha: {
                    label: "CAPTCHA",
                    type: "CaptchaTextInput",
                    required: true,
                    help_text: "Enter the characters shown in the image",
                    disabled: false,
                    widget: "CaptchaTextInput"
                }
            }
        },
        login: {
            fields: {
                username: {
                    label: "Username",
                    type: "TextInput",
                    required: true,
                    help_text: "Enter your username",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 150
                },
                password: {
                    label: "Password",
                    type: "PasswordInput",
                    required: true,
                    help_text: "Enter your password",
                    disabled: false,
                    widget: "PasswordInput"
                }
            }
        },
        signup: {
            fields: {
                first_name: {
                    label: "First Name",
                    type: "TextInput",
                    required: false,
                    help_text: "Your first name",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 30
                },
                last_name: {
                    label: "Last Name",
                    type: "TextInput",
                    required: false,
                    help_text: "Your last name",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 30
                },
                username: {
                    label: "Username",
                    type: "TextInput",
                    required: true,
                    help_text: "Choose a unique username",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 150
                },
                email: {
                    label: "Email Address",
                    type: "EmailInput",
                    required: true,
                    help_text: "Enter a valid email address",
                    disabled: false,
                    widget: "EmailInput",
                    max_length: 254
                },
                password: {
                    label: "Password",
                    type: "PasswordInput",
                    required: true,
                    help_text: "Password must be at least 8 characters",
                    disabled: false,
                    widget: "PasswordInput",
                    min_length: 8
                },
                password_confirm: {
                    label: "Confirm Password",
                    type: "PasswordInput",
                    required: true,
                    help_text: "Enter your password again",
                    disabled: false,
                    widget: "PasswordInput"
                }
            }
        },
        contact: {
            fields: {
                name: {
                    label: "Name",
                    type: "TextInput",
                    required: true,
                    help_text: "Your full name",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 50
                },
                email: {
                    label: "Email",
                    type: "EmailInput",
                    required: true,
                    help_text: "Enter a valid email address",
                    disabled: false,
                    widget: "EmailInput",
                    max_length: 70
                },
                subject: {
                    label: "Subject",
                    type: "TextInput",
                    required: true,
                    help_text: "What's this about?",
                    disabled: false,
                    widget: "TextInput",
                    max_length: 150
                },
                message: {
                    label: "Message",
                    type: "Textarea",
                    required: true,
                    help_text: "Tell me about your project or just say hello...",
                    disabled: false,
                    widget: "Textarea",
                    max_length: 1000
                }
            }
        }
    };
    
    return configs[formType] || configs.contact;
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const initializeFormData = (
    fields: Record<string, FieldConfig>,
    initialData?: Record<string, string | boolean>,
    captchaKey?: string
): Record<string, FormValue> => {
    const data: Record<string, FormValue> = {};
    
    Object.keys(fields).forEach(fieldName => {
        const fieldConfig = fields[fieldName];
        
        if (fieldConfig.widget === 'FileInput' || fieldConfig.widget === 'ImageInput') {
            data[fieldName] = fieldConfig.multiple ? [] : '';
        } else if (fieldConfig.widget === 'CheckboxInput') {
            data[fieldName] = false;
        } else {
            data[fieldName] = '';
        }
        
        // Pre-fill captcha key
        if (fieldName === 'captcha' && captchaKey) {
            data['captcha_0'] = captchaKey;
        }
    });
    
    // Override with provided initial data
    if (initialData) {
        Object.entries(initialData).forEach(([key, value]) => {
            if (key in data) {
                data[key] = value;
            }
        });
    }
    
    return data;
};

export const getFieldLayoutClass = (fieldName: string, formType: string): string => {
    // Full width fields
    if (['message', 'captcha', 'comment', 'description'].includes(fieldName)) {
        return 'col-12 mb-3';
    }
    
    // Login form - stack all fields
    if (formType === 'login') {
        return 'col-12 mb-3';
    }
    
    // Signup form - name fields side by side
    if (formType === 'signup' && ['first_name', 'last_name'].includes(fieldName)) {
        return 'col-md-6 mb-3';
    }
    
    // Contact form - name and email side by side
    if (formType === 'contact' && ['name', 'email'].includes(fieldName)) {
        return 'col-md-6 mb-3';
    }
    
    return 'col-12 mb-3';
};
