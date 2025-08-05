import { fieldValidator } from "./updateFieldStatus.js";


/**
 * Utility function to create a password toggle.
 * @param {string} fieldId 
 * @returns 
 */
export function createPasswordToggle(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (field.parentElement.querySelector('.password-toggle-btn')) return;
    if(!field.parentElement.classList.contains('password-toggle-container')) {
        const container = document.createElement('div');
        container.className = 'password-toggle-container';
        field.parentElement.insertBefore(container, field);
        field.parentElement.classList.add('row', 'align-items-center');
        container.appendChild(field);
    }

    const toggle = document.createElement('a');
    toggle.type = 'button';
    toggle.className = 'password-toggle-btn';
    toggle.innerHTML = '👁️';
    toggle.title = 'Show/Hide Password';

    toggle.classList.add('password-field-with-toggle', 'btn', 'border-0');
    toggle.addEventListener('click', () => {
        const type = field.type === 'password' ? 'text' : 'password';
        field.type = type;
        toggle.title = type === 'password' ? 'Show Password' : 'Hide Password';
        toggle.innerHTML = type === 'password' ? '👁️' : '🙈';
    });

    field.parentElement.appendChild(toggle);
}


/**
 * Function to update password validation and strength indicator.
 * @param {string} fieldId - The ID of the password field.
 * @returns {void} nothing.
 */
export function createPasswordStrengthIndicator(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const container = field.parentElement;

    const existingIndicator = container.querySelector('.password-strength-indicator');
    if (existingIndicator) existingIndicator.remove();

    const isPasswordChangeForm = fieldId === 'id_new_password1' || fieldId === 'id_new_password2';
    const isConfirmationField = document.getElementById('id_new_password2') !== null || document.getElementById('password2') !== null;

    const indicator = document.createElement('div');
    indicator.className = 'password-strength-indicator';
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">Password strength</div>
        <div class="strength-requirements">
            <div class="requirement" data-type="length">
                <span class="requirement-icon">○</span> At least 8 characters
            </div>
            <div class="requirement" data-type="uppercase">
                <span class="requirement-icon">○</span> At least 1 uppercase letter
            </div>
            <div class="requirement" data-type="lowercase">
                <span class="requirement-icon">○</span> At least 1 lowercase letter
            </div>
            <div class="requirement" data-type="numbers">
                <span class="requirement-icon">○</span> At least 1 number
            </div>
            <div class="requirement" data-type="special">
                <span class="requirement-icon">○</span> At least 1 special character
            </div>
            ${isConfirmationField ? `
                <div class="requirement" data-type="match">
                    <span class="requirement-icon">○</span> Both New passwords match
                </div>
            ` : ''}
            ${isPasswordChangeForm ? `
                <div class="requirement" data-type="different">
                    <span class="requirement-icon">○</span> Old and New passwords are different
                </div>
            ` : ''}
        </div>
    `;
    container.appendChild(indicator);
}



/**
 * Function to analyze password strength.
 * @param {string} password - The password to analyze.
 * @returns {Object} - An object containing password strength analysis.
 */
function analyzePassword(password) {
    if (!password || typeof password !== 'string') {
        return {
            length: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumbers: false,
            hasSpecialChar: false,
            score: 0,
            isStrong: false,
            isWeak: true
        };
    }
    const analysis = {
        length: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        score: 0
    };

    // Calculate strength score
    if (analysis.length) analysis.score++;
    if (analysis.hasUpperCase) analysis.score++;
    if (analysis.hasLowerCase) analysis.score++;
    if (analysis.hasNumbers) analysis.score++;
    if (analysis.hasSpecialChar) analysis.score++;

    analysis.isStrong = analysis.score >= 5;
    analysis.isWeak = analysis.score < 3;

    return analysis;
}



/**
 * Function to update password strength.
 * @param {string} fieldId - The ID of the password field.
 * @param {string} password - The password to analyze.
 * @param {string} confirmationPassword - The confirmation password (if applicable).
 * @param {string} oldPassword - The old password (if applicable).
 * @returns {void} no return value.
 */
export function updatePasswordStrengthIndicator(fieldId = '', password = '', confirmationPassword = '', oldPassword = '') {
    const field = document.getElementById(fieldId);
    if (!field) return;

   const indicator = field.parentElement.querySelector('.password-strength-indicator');
    if (!indicator) return;

    const analysis = analyzePassword(password);
    const strengthFill = indicator.querySelector('.strength-fill');
    const strengthText = indicator.querySelector('.strength-text');
    const requirements = indicator.querySelectorAll('.requirement');

    // create a copy of analysis results
    // we will add scores for confirmation and old password checks
    // const analysis = { ...analysis };
    // update the analysis with confirmation and old password checks
    requirements.forEach(req => {
        const type = req.dataset.type;
        switch (type) {
            case 'match':
                if (confirmationPassword.length > 0 && password.length > 0) {
                    analysis.match = password === confirmationPassword;
                }
                break;
            case 'different':
                if (oldPassword) {
                    if (password.length > 0 && oldPassword.length > 0) {
                        analysis.different = password !== oldPassword;
                    }
                }
                break;
        }
    });
    let score = analysis.score;
    if (analysis.match) score++;
    if (analysis.different) score++;

    if (analysis.score === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength';
        //indicator.classList.remove('weak', 'medium', 'strong');
    } else if (analysis.score < 3) {
        strengthFill.style.width = '33%';
        strengthFill.className = 'strength-fill weak';
        strengthText.textContent = 'Weak password';
        strengthFill.style.backgroundColor = '#de372b' // redish color for danger
        strengthText.style.color = '#de372b'; // red color for danger
    } else if (analysis.score < 5) {
        strengthFill.style.width = '66%';
        strengthFill.className = 'strength-fill medium';
        strengthText.textContent = 'Medium password';
        strengthFill.style.backgroundColor = '#fa8509'; // orange color for medium
        strengthText.style.color = '#fa8509'; // orange color for medium
    } else {
        strengthFill.style.width = '100%';
        strengthFill.className = 'strength-fill strong';
        strengthText.textContent = 'Strong password';
        strengthFill.style.backgroundColor = '#067709'; // green color for success
        strengthText.style.color = '#067709'; // green color for success
    }

    // Update requirements
    requirements.forEach(req => {
        const type = req.dataset.type;
        const isMet = analysis[type === 'length' ? 'length' :
            type === 'uppercase' ? 'hasUpperCase' :
                type === 'lowercase' ? 'hasLowerCase' :
                    type === 'numbers' ? 'hasNumbers' :
                        type === 'special' ? 'hasSpecialChar' :
                            type === 'match' ? 'match' :
                                type === 'different' ? 'different' : false];
        if (isMet) {
            req.classList.add('met');
        } else {
            req.classList.remove('met');
        }
    });
}



/**
 * Function to update password validation for both single and confirmation fields.
 * @returns {void} no return value.
 */
export function updatePasswordValidation() {
    const password1Field = document.getElementById('password1');
    const password2Field = document.getElementById('password2');

    // Handle single password field case (login form)
    if (password1Field) {
        const password = password1Field.value;
        fieldValidator.clearFieldValidation(password1Field, 'password1');

        if (password.length === 0) {
            // Empty field - no validation needed yet
        } else {
            const analysis = analyzePassword(password);

            if (analysis.isStrong) {
                fieldValidator.setFieldSuccess(password1Field, 'password1', 'Password meets requirements');
            } else {
                fieldValidator.setFieldError(password1Field, 'password1', 'Password must meet all requirements');
            }
        }
        

        // Update password strength indicator
        const confirmationPassword = password2Field ? password2Field.value : '';
        updatePasswordStrengthIndicator('password1', password, confirmationPassword, '');
    }

    // Handle registration form case (password1 & password2)
    if (password1Field && password2Field) {
        const password1 = password1Field.value;
        const password2 = password2Field.value;

        // Clear previous validation for password2
        fieldValidator.clearFieldValidation(password2Field, 'password2');

        // Validate password2 match
        if (password2.length === 0) {
            // Empty field - no validation needed yet
        } else {
            if (password1 !== password2) {
                fieldValidator.setFieldError(password2Field, 'password2', 'Passwords do not match');
            } else if (password1.length > 0 && analyzePassword(password1).isStrong) {
                fieldValidator.setFieldSuccess(password2Field, 'password2', 'Passwords match');
            } else if (password1.length > 0) {
                fieldValidator.setFieldError(password2Field, 'password2', 'New password must meet all requirements first');
            }
        }
    }

    // Update submit button
    fieldValidator.updateSubmitButtonState();
}



/**
 * Function to update password change validation.
 * Validates old password, new password, and confirmation.
 * @returns {void} no return value.
 */
export function updatePasswordChangeValidation() {
    const oldPasswordField = document.getElementById('id_old_password');
    const newPassword1Field = document.getElementById('id_new_password1');
    const newPassword2Field = document.getElementById('id_new_password2');

    // Validate old password field
    if (oldPasswordField) {
        const oldPassword = oldPasswordField.value;
        fieldValidator.clearFieldValidation(oldPasswordField, 'old_password');

        if (oldPassword.length === 0) {
            // Empty field - no validation needed yet
        } else if (oldPassword.length < 8) {
            // Basic length check for old password
            fieldValidator.setFieldError(oldPasswordField, 'old_password', 'Current password appears invalid');
        } else {
            // Old password has content and meets basic length - mark as valid for UI
            oldPasswordField.classList.add('char-valid');
        }
    }

    // Validate new password 1
    if (newPassword1Field) {
        const newPassword1 = newPassword1Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';

        fieldValidator.clearFieldValidation(newPassword1Field, 'new_password1');

        if (newPassword1.length === 0) {
            // Empty field - no validation needed yet
        } else {
            const analysis = analyzePassword(newPassword1);

            // Check if new password is same as old password
            if (oldPassword.length > 0 && newPassword1 === oldPassword) {
                fieldValidator.setFieldError(newPassword1Field, 'new_password1', 'New password must be different from current password');
            } else if (!analysis.isStrong) {
                fieldValidator.setFieldError(newPassword1Field, 'new_password1', 'Password must meet all requirements');
            } else {
                fieldValidator.setFieldSuccess(newPassword1Field, 'new_password1', 'Password meets requirements');
            }
        }

        // Update password strength indicator for new password
        const confirmationPassword = newPassword2Field ? newPassword2Field.value : '';
        updatePasswordStrengthIndicator('id_new_password1', newPassword1, confirmationPassword, oldPassword);
    }

    // Validate new password 2 (confirmation)
    if (newPassword2Field) {
        const newPassword1 = newPassword1Field ? newPassword1Field.value : '';
        const newPassword2 = newPassword2Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';

        fieldValidator.clearFieldValidation(newPassword2Field, 'new_password2');

        if (newPassword2.length === 0) {
            // Empty field - no validation needed yet
        } else {
            // Check if confirmation matches new password
            if (newPassword1 !== newPassword2) {
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'Passwords do not match');
            }
            // Check if confirmation is same as old password
            else if (oldPassword.length > 0 && newPassword2 === oldPassword) {
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'New password must be different from current password');
            }
            // Check if new password meets strength requirements
            else if (newPassword1.length > 0 && !analyzePassword(newPassword1).isStrong) {
                // Don't mark as valid until the first password is strong
                fieldValidator.setFieldError(newPassword2Field, 'new_password2', 'New password must meet all requirements first');
            }
            // All validations passed
            else if (newPassword1.length > 0) {
                fieldValidator.setFieldSuccess(newPassword2Field, 'new_password2', 'Passwords match');
            }
        }
    }

    // Update submit button state
    fieldValidator.updateSubmitButtonState();
}
