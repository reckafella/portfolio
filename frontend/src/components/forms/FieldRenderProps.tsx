import { FieldConfig, FormValue, CaptchaData } from "@/types/unifiedForms";
import { FileUpload, ImageUpload  } from "./FileUpload";
import { CaptchaInput } from "./Captcha";

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
    isRefreshingCaptcha
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
            return <input type="password" {...textBaseProps} />;
            
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
