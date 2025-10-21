import React from 'react';

export interface FieldConfig {
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
    choices?: Array<[string, string]>;
    accept?: string;
    multiple?: boolean;
    max_size?: number;
}

export interface FormConfig {
    fields: Record<string, FieldConfig>;
}

export interface CaptchaData {
    key: string;
    image: string;
}

export interface UnifiedFormProps {
    formType: 'contact' | 'login' | 'signup' | 'create_project' | 'update_project' | 'create_article' | 'update_article' | 'comment';
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

export type FormValue = string | File | File[] | boolean;

export const MAX_IMAGES: number = 5;
export const IMAGE_MIME_TYPES: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
