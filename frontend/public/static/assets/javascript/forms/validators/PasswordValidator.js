import { FieldValidator } from './FieldValidator.js';

/**
 * PasswordValidator extends FieldValidator with password-specific validation methods
 */
export class PasswordValidator extends FieldValidator {
    /**
     * Validate password and optionally compare with confirmation and old password
     * @param {string} fieldId - Password field ID
     * @param {string} confirmFieldId - Confirmation password field ID (optional)
     * @param {string} oldPasswordFieldId - Old password field ID (optional)
     */
    validate(fieldId, confirmFieldId = null, oldPasswordFieldId = null) {
        const field = document.getElementById(fieldId);
        this.clearFieldValidation(field, fieldId);

        const displayName = this.getFieldDisplayName(fieldId) || 'Password';

        // Check password strength
        if (field) {
            const password = field?.value;

            if (password.length === 0) {
                if (this.isFieldRequired(fieldId)) {
                    this.setFieldError(field, fieldId, '');
                }
            } else {
                const analysis = this.analyzePassword(password);
                if (analysis.isStrong) {
                    this.setFieldSuccess(field, fieldId, `${displayName} is a strong password`);
                } else if (analysis.isWeak) {
                    this.setFieldError(field, fieldId, `${displayName} does not meet requirements`);
                }
            }
        }
        const confirmationPassword = confirmFieldId ? document.getElementById(confirmFieldId)?.value : '';
        this.updatePasswordStrengthIndicator(fieldId, field ? field.value : '', confirmationPassword, '');

        // Check if matches confirmation
        if (confirmFieldId) {
            const confirmField = document.getElementById(confirmFieldId);
            if (confirmField && confirmField?.value) {
                this.validateConfirmation(fieldId, confirmFieldId);
            }
        }

        // Check if different from old password
        if (oldPasswordFieldId) {
            const oldPasswordField = document.getElementById(oldPasswordFieldId);
            if (oldPasswordField && oldPasswordField.value) {
                this.validatePasswordChangeForm(oldPasswordFieldId, fieldId, confirmFieldId);
            }
        }
    }

    /**
     * Validate confirmation password matches
     * @param {string} passwordFieldId - Password field ID
     * @param {string} confirmFieldId - Confirmation password field ID
     */
    validateConfirmation(passwordFieldId, confirmFieldId) {
        const passwordField = document.getElementById(passwordFieldId);
        const confirmField = document.getElementById(confirmFieldId);

        if (passwordField && confirmField) {
            const password = passwordField?.value;
            const confirmationPassword = confirmField?.value;

            this.clearFieldValidation(confirmField, confirmFieldId);

            if (confirmationPassword.length === 0) {
                // do nothing - empty field
            } else {
                if (password !== confirmationPassword) {
                    this.setFieldError(confirmField, confirmFieldId, 'Passwords do not match.');
                } else if (password.length > 0 && this.analyzePassword(password).isStrong) {
                    this.setFieldSuccess(confirmField, confirmFieldId, 'Passwords match.');
                } else if (password.length > 0) {
                    this.setFieldError(confirmField, confirmFieldId, 'New Password must meet all requirements first.');
                }
            }
        }
    }

    /**
     * Validate that new password is different from old password
     * @param {string} newPasswordFieldId - New password field ID
     * @param {string} oldPasswordFieldId - Old password field ID
     */
    validatePasswordChanged(newPasswordFieldId, oldPasswordFieldId) {
        const newPasswordField = document.getElementById(newPasswordFieldId);
        const oldPasswordField = document.getElementById(oldPasswordFieldId);
        
        if (!newPasswordField || !oldPasswordField) return;

        const newPassword = newPasswordField.value;
        const oldPassword = oldPasswordField.value;

        if (newPassword && oldPassword && newPassword === oldPassword) {
            this.setFieldError(
                newPasswordField, 
                newPasswordFieldId, 
                'New password must be different from old password'
            );
        }
    }

    validatePasswordChangeForm(oldPasswordFieldId, newPassword1FieldId, newPassword2FieldId) {
        const oldPasswordField = document.getElementById(oldPasswordFieldId);
        const newPassword1Field = document.getElementById(newPassword1FieldId);
        const newPassword2Field = document.getElementById(newPassword2FieldId);

        if (oldPasswordField) {
            const oldPassword = oldPasswordField?.value;
            this.clearFieldValidation(oldPasswordField, oldPasswordFieldId);

            if (oldPassword.length === 0) {
                //
            } else if (oldPassword.length < 8) {
                this.setFieldError(oldPasswordField, oldPasswordFieldId, 'Current Password appears invalid.');
            } else {
                this.setFieldSuccess(oldPasswordField, oldPasswordFieldId, '');
                oldPasswordField.classList.add('char-valid');
            }
        }

        if (newPassword1Field) {
            const newPassword1 = newPassword1Field?.value;
            const oldPassword = oldPasswordField ? oldPasswordField?.value : '';

            this.clearFieldValidation(newPassword1Field, newPassword1FieldId);

            if (newPassword1.length === 0) {
            // Empty field - no validation needed yet
            } else {
                const analysis = analyzePassword(newPassword1);

                // Check if new password is same as old password
                if (oldPassword.length > 0 && newPassword1 === oldPassword) {
                    this.setFieldError(newPassword1Field, 'new_password1', 'New password must be different from current password');
                } else if (!analysis.isStrong) {
                    this.setFieldError(newPassword1Field, 'new_password1', 'Password must meet all requirements');
                } else {
                    this.setFieldSuccess(newPassword1Field, 'new_password1', 'Password meets requirements');
                }
            }

            const newPassword2 = newPassword2Field ? newPassword2Field?.value : '';
            this.updatePasswordStrengthIndicator(newPassword1Field, newPassword1, newPassword2, oldPassword);
        }

        if (newPassword2Field) {
            const newPassword1 = newPassword1Field ? newPassword1Field?.value : '';
            const newPassword2 = newPassword2Field?.value;
            const oldPassword = oldPasswordField ? oldPasswordField?.value : '';

            this.clearFieldValidation(newPassword2Field, newPassword2FieldId);

            if (newPassword2.length === 0) {
                // Empty field - no validation needed yet
            } else {
                // Check if confirmation matches new password
                if (newPassword1 !== newPassword2) {
                    this.setFieldError(newPassword2Field, newPassword1FieldId, 'Passwords do not match');
                }
                // Check if confirmation is same as old password
                else if (oldPassword.length > 0 && newPassword2 === oldPassword) {
                    this.setFieldError(newPassword2Field, newPassword1FieldId, 'New password must be different from current password');
                }
                // Check if new password meets strength requirements
                else if (newPassword1.length > 0 && !analyzePassword(newPassword1).isStrong) {
                    // Don't mark as valid until the first password is strong
                    this.setFieldError(newPassword2Field, newPassword1FieldId, 'New password must meet all requirements first');
                }
                // All validations passed
                else if (newPassword1.length > 0) {
                    this.setFieldSuccess(newPassword2Field, newPassword1FieldId, 'Passwords match');
                }
            }
        }
    }

    /**
     * Create toggle for password visibility
     * @param {string} fieldId - Password field ID
     */
    createToggle(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Check if toggle already exists
        if (field.parentElement.querySelector('.password-toggle-btn')) return;

        if (!field.parentElement.classList.contains('password-toggle-container')) {
            const container = document.createElement('div');
            container.className = 'password-toggle-container';
            field.parentElement.insertBefore(container, field);
            field.parentElement.classList.add('row', 'align-items-center');
            container.appendChild(field);
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'password-toggle-btn';
        toggle.innerHTML = '👁️';
        toggle.title = 'Show/Hide Password';

        toggle.classList.add('password-field-with-toggle', 'btn', 'border-0', 'rounded-0');
        toggle.addEventListener('click', () => {
            const type = field.type === 'password' ? 'text' : 'password';
            field.type = type;
            toggle.title = type === 'password' ? 'Show Password' : 'Hide Password';
            toggle.innerHTML = type === 'password' ? '👁️' : '🙈';
        });

        field.parentElement.appendChild(toggle);
    }

    /**
     * Create password strength indicator
     * @param {string} fieldId - Password field ID
     */
    createStrengthIndicator(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Create container for strength indicator
        const container = field.parentElement;

        // Check if indicator already exists
        const existingIndicator = container.querySelector('.password-strength-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        const isPasswordChangeForm = fieldId === 'id_new_password1' || fieldId === 'id_new_password2';
        const isConfirmationField = document.getElementById('id_new_password2') !== null || document.getElementById('password2') !== null;

        const uniqueId = `password-strength-${fieldId}`;
        const indicator = document.createElement('div');
        indicator.className = 'password-strength-indicator accordion accordion-flush';
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">Password strength</div>
            <div class="accordion-item">
                <h4 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${uniqueId}" aria-expanded="false" aria-controls="${uniqueId}">
                        Password Requirements
                    </button>
                </h4>
                <div id="${uniqueId}" class="accordion-collapse collapse">
                    <div class="accordion-body strength-requirements">
                        <div class="requirement" data-type="length">
                            <span class="requirement-icon">○</span> At least 8 characters
                        </div>
                        <div class="requirement" data-type="uppercase">
                            <span class="requirement-icon">○</span> Uppercase letters (A-Z)
                        </div>
                        <div class="requirement" data-type="lowercase">
                            <span class="requirement-icon">○</span> Lowercase letters (a-z)
                        </div>
                        <div class="requirement" data-type="numbers">
                            <span class="requirement-icon">○</span> Numbers (0-9)
                        </div>
                        <div class="requirement" data-type="special">
                            <span class="requirement-icon">○</span> Special characters (!@#$%^&*)
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
                </div>
            </div>
        `;
        container.appendChild(indicator);
    }

    /**
     * Analyze password strength
     * @param {string} password - The password to analyze
     * @returns {Object} - Analysis results
     */
    analyzePassword(password) {
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
        
        // Length check (up to 4 points)
        if (password.length >= 8) analysis.score += 1;
        //if (password.length >= 10) analysis.score += 1;
        //if (password.length >= 12) analysis.score += 1;
        //if (password.length >= 16) analysis.score += 1;
        
        // Character types (1 point each)
        if (analysis.hasLowerCase) analysis.score += 1;
        if (analysis.hasUpperCase) analysis.score += 1;
        if (analysis.hasNumbers) analysis.score += 1;
        if (analysis.hasSpecialChar) analysis.score += 1;

        // Determine if password is weak
        analysis.isWeak = analysis.score < 3;
        analysis.isStrong = analysis.score >= 5;

        return analysis;
    }

    /**
     * Update password strength indicator
     * @param {string} fieldId - Password field ID
     * @param {string} password - Password value
     * @param {string} confirmationPassword - Confirmation password value
     * @param {string} oldPassword - Old password value
     */
    updatePasswordStrengthIndicator(fieldId = '', password = '', confirmationPassword = '', oldPassword = '') {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const indicator = field.parentElement.querySelector('.password-strength-indicator');
        if (!indicator) return;

        const analysis = this.analyzePassword(password);
        const strengthFill = indicator.querySelector('.strength-fill');
        const strengthText = indicator.querySelector('.strength-text');
        const requirements = indicator.querySelectorAll('.requirement');
        
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

    getFieldDisplayName(fieldId) {
        const displayNames = {
            'id_password': 'Password',
            'id_password1': 'Password',
            'id_password2': 'Confirm Password',
            'id_old_password': 'Old Password',
            'id_new_password1': 'New Password',
            'id_new_password2': 'Confirm New Password'
        };
        return displayNames[fieldId] || 'Password';
    }
}
