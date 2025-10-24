import React, { useState, useEffect, useCallback } from 'react';
import './ImageUpload.css';
import '../../styles/captcha.css';
import { FormValue, CaptchaData, UnifiedFormProps, FieldConfig } from '../../types/unifiedForms';
import { useCaptchaRefresh } from '../../hooks/useCaptcha';
import {
    initializeFormData, getFieldLayoutClass
} from '../../utils/unifiedFormApis';
import useFormConfig from '../../hooks/useUnifiedForm';
import { FieldRenderer } from './FieldRenderProps';


const UnifiedForm: React.FC<UnifiedFormProps> = ({
    formType,
    onSubmit,
    isSubmitting,
    error,
    success,
    title,
    slug,
    submitButtonText = 'Submit',
    loadingText = 'Processing...',
    additionalContent,
    initialData
}) => {
    const [formData, setFormData] = useState<Record<string, FormValue>>({});
    const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
    
    // Fetch form configuration
    const { data: formConfig, isLoading, isError } = useFormConfig(formType, slug);
    
    // Captcha refresh mutation
    const { mutate: refreshCaptcha, isPending: isRefreshingCaptcha } = useCaptchaRefresh();
    
    // Initialize form data when config is loaded
    useEffect(() => {
        if (formConfig) {
            // Extract CAPTCHA data if present
            const captchaField = formConfig.fields?.captcha;
            if (captchaField?.captcha_key && captchaField?.captcha_image) {
                const newCaptchaData = {
                    key: captchaField.captcha_key,
                    image: captchaField.captcha_image
                };
                setCaptchaData(newCaptchaData);
                
                const initializedData = initializeFormData(
                    formConfig.fields,
                    initialData,
                    newCaptchaData.key
                );
                setFormData(initializedData);
            } else {
                const initializedData = initializeFormData(formConfig.fields, initialData);
                setFormData(initializedData);
            }
        }
    }, [formConfig, initialData]);
    
    // Handle input changes
    const handleInputChange = useCallback((fieldName: string, value: FormValue) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    }, []);
    
    // Handle file changes
    const handleFileChange = useCallback((
        fieldName: string,
        files: FileList | File[] | null,
        multiple: boolean = false
    ) => {
        if (!files) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: multiple ? [] : ''
            }));
            return;
        }
        
        const fileArray = Array.isArray(files) ? files : Array.from(files);
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: multiple ? fileArray : fileArray[0]
        }));
    }, []);
    
    // Handle captcha refresh
    const handleRefreshCaptcha = useCallback(() => {
        const oldKey = captchaData?.key;
        
        refreshCaptcha(oldKey, {
            onSuccess: (data) => {
                setCaptchaData(data);
                setFormData(prev => ({
                    ...prev,
                    captcha_0: data.key,
                    captcha_1: '',
                    captcha: ''
                }));
                
                // Clear the input element
                const captchaInput = document.querySelector(
                    'input[name="captcha"], input[placeholder*="characters"]'
                ) as HTMLInputElement;
                if (captchaInput) {
                    captchaInput.value = '';
                }
            }
        });
    }, [captchaData?.key, refreshCaptcha]);
    
    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = { ...formData };
        
        // Handle CAPTCHA field specially for forms with captcha
        if (captchaData && formData.captcha) {
            submitData.captcha_0 = captchaData.key;
            submitData.captcha_1 = formData.captcha;
            delete submitData.captcha;
        }
        
        await onSubmit(submitData);
    }, [formData, captchaData, onSubmit]);
    
    // Loading state
    if (isLoading) {
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
    
    // Error state
    if (isError || !formConfig) {
        return (
            <div className="alert alert-danger" role="alert">
                Failed to load {formType} form. Please try again later.
            </div>
        );
    }
    
    return (
        <div className="rounded-0 shadow p-4">
            <div className="section-title mb-0">
                {title && (
                    <h2 className="fw-bold">{title}</h2>
                )}
            </div>
            
            {success && (
                <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {formType === 'contact' && "Message sent successfully! I'll get back to you soon."}
                    {formType === 'login' && 'Login successful! Redirecting...'}
                    {formType === 'signup' && 'Account created successfully! Welcome!'}
                    {formType === 'comment' && 'Comment posted successfully!'}
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
                    {Object.entries(formConfig.fields).map(([fieldName, fieldConfig]) => {
                        const config = fieldConfig as FieldConfig;
                        return (
                        <div key={fieldName} className={getFieldLayoutClass(fieldName, formType)}>
                            {config.widget !== 'CheckboxInput' && (
                                <label htmlFor={fieldName} className="form-label fw-medium">
                                    {config.label}
                                    {config.required && <span className="text-danger ms-1">*</span>}
                                </label>
                            )}
                            <FieldRenderer
                                fieldName={fieldName}
                                fieldConfig={config}
                                value={formData[fieldName]}
                                onChange={handleInputChange}
                                onFileChange={handleFileChange}
                                isSubmitting={isSubmitting}
                                captchaData={captchaData}
                                onRefreshCaptcha={handleRefreshCaptcha}
                                isRefreshingCaptcha={isRefreshingCaptcha}
                            />
                        </div>
                    );})}
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
                                {loadingText}
                            </div>
                        ) : (
                            submitButtonText
                        )}
                    </button>
                </div>
                
                {additionalContent && (
                    <div className="text-center mt-3">
                        {additionalContent}
                    </div>
                )}
            </form>
        </div>
    );
};

export default UnifiedForm;
