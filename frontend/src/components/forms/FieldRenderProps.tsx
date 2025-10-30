import { FieldConfig, FormValue, CaptchaData } from "@/types/unifiedForms";
import { FileUpload, ImageUpload  } from "./FileUpload";
import { CaptchaInput } from "./Captcha";
import { PasswordInput } from "./PasswordInput";

export interface FieldRendererProps {
    fieldName: string;
    fieldConfig: FieldConfig;
    value: FormValue;
    onChange: (_fieldName: string, _value: FormValue) => void;
    onFileChange: (_fieldName: string, _files: FileList | File[] | null, _multiple: boolean) => void;
    isSubmitting: boolean;
    captchaData: CaptchaData | null;
    onRefreshCaptcha: () => void;
    isRefreshingCaptcha: boolean;
    allFormData?: Record<string, FormValue>;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
    fieldName,
    fieldConfig,
    value,
    onChange,
    onFileChange,
    isSubmitting,
    captchaData,
    onRefreshCaptcha,
    isRefreshingCaptcha,
    allFormData
}) => {
    const { required, help_text, disabled, widget, max_length, min_length, choices, accept, multiple, max_size } = fieldConfig;
    
    const baseProps = {
        id: fieldName,
        name: fieldName,
        required,
        disabled: disabled || isSubmitting,
        className: "form-control"
    };
    
    const textBaseProps = {
        ...baseProps,
        value: typeof value === 'string' ? value : '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            onChange(fieldName, e.target.value),
        placeholder: help_text,
        maxLength: max_length,
        minLength: min_length
    };
    
    const booleanBaseProps = {
        ...baseProps,
        className: "form-check-input",
        checked: Boolean(value),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(fieldName, e.target.checked)
    };
    
    const fileBaseProps = {
        ...baseProps,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onFileChange(fieldName, e.target.files, multiple ?? false),
        accept,
        multiple
    };
    
    switch (widget) {
        case 'TextInput':
            return <input type="text" {...textBaseProps} />;
            
        case 'EmailInput':
            return <input type="email" {...textBaseProps} />;
            
        case 'PasswordInput':
            // Determine if this is a confirmation field or if we need to compare with other passwords
            const isConfirmField = fieldName.includes('confirm') || fieldName.includes('password2') || fieldName === 'password_confirm';
            const isNewPasswordField = fieldName.includes('new_password') || fieldName === 'password1' || fieldName === 'password';
            
            // Get related password values for comparison
            let confirmPasswordValue: string | undefined;
            let oldPasswordValue: string | undefined;
            
            if (allFormData) {
                // For primary password field, check if there's a confirmation field
                if (isNewPasswordField && !isConfirmField) {
                    confirmPasswordValue = (allFormData['password_confirm'] || allFormData['password2']) as string;
                }
                
                // For confirmation field, get the primary password
                if (isConfirmField) {
                    confirmPasswordValue = (allFormData['password1'] || allFormData['password']) as string;
                }
                
                // Check for old password (for password change forms)
                if (fieldName.includes('new_password')) {
                    oldPasswordValue = allFormData['old_password'] as string;
                }
            }
            
            return (
                <PasswordInput
                    fieldName={fieldName}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(name, val) => onChange(name, val)}
                    required={required}
                    disabled={disabled || isSubmitting}
                    placeholder={help_text}
                    maxLength={max_length}
                    minLength={min_length}
                    showStrengthMeter={!isConfirmField}
                    showRequirements={!isConfirmField}
                    confirmPasswordValue={confirmPasswordValue}
                    oldPasswordValue={oldPasswordValue}
                    isConfirmField={isConfirmField}
                    className={baseProps.className}
                />
            );
            
        case 'NumberInput':
            return <input type="number" {...textBaseProps} />;
            
        case 'URLInput':
            return <input type="url" {...textBaseProps} />;
            
        case 'Textarea':
            return <textarea {...textBaseProps} rows={5} style={{ resize: 'vertical' }} />;
            
        case 'Select':
            return (
                <select {...textBaseProps}>
                    <option value="">Choose...</option>
                    {choices?.map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
            );
            
        case 'FileInput':
            return (
                <FileUpload
                    fieldName={fieldName}
                    value={value}
                    onFileChange={onFileChange}
                    fileBaseProps={fileBaseProps}
                    accept={accept}
                    multiple={multiple}
                    max_size={max_size}
                />
            );
            
        case 'ImageInput':
            return (
                <ImageUpload
                    fieldName={fieldName}
                    value={value}
                    onFileChange={onFileChange}
                    fileBaseProps={fileBaseProps}
                    accept={accept}
                    multiple={multiple}
                    max_size={max_size}
                />
            );
            
        case 'CaptchaTextInput':
            return (
                <CaptchaInput
                    fieldName={fieldName}
                    textBaseProps={textBaseProps}
                    captchaData={captchaData}
                    onRefresh={onRefreshCaptcha}
                    isRefreshing={isRefreshingCaptcha}
                    isSubmitting={isSubmitting}
                />
            );
            
        case 'CheckboxInput':
            return (
                <div className="form-check">
                    <input type="checkbox" role="switch" {...booleanBaseProps} />
                    <label htmlFor={fieldName} className="form-check-label ms-2">
                        {fieldConfig.label || fieldConfig.help_text || 'Enable this option'}
                    </label>
                </div>
            );
            
        default:
            return <input type="text" {...textBaseProps} />;
    }
};
