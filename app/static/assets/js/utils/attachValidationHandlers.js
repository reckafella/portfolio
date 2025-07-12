export default function attachValidationHandlers(fieldId, config) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const updateCharCount = () => updateCharacterCount(fieldId, config, validationErrors, updateSubmitButton);
    updateCharCount();

    field.addEventListener('input', updateCharCount);
    field.addEventListener('paste', () => setTimeout(updateCharCount, 10));
    field.addEventListener('keyup', updateCharCount);

    if (typeof config.validate === 'function') {
        const validator = () => config.validate(fieldId, validationErrors, updateSubmitButton);
        validator();

        field.addEventListener('input', validator);
        field.addEventListener('blur', validator);
        field.addEventListener('paste', () => setTimeout(validator, 10));
    }
}