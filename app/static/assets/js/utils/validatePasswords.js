// Function to check password strength with detailed feedback
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

// Function to create password strength indicator
export function createPasswordStrengthIndicator(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const container = field.parentElement;

    // Remove existing indicators
    const existingIndicator = container.querySelector('.password-strength-indicator');
    if (existingIndicator) existingIndicator.remove();

    // Create strength indicator
    const indicator = document.createElement('div');
    indicator.className = 'password-strength-indicator';
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">Password strength</div>
        <div class="strength-requirements">
            <div class="requirement" data-type="length">
                <span class="requirement-icon">○</span>
                <span class="requirement-text">At least 8 characters</span>
            </div>
            <div class="requirement" data-type="uppercase">
                <span class="requirement-icon">○</span>
                <span class="requirement-text">Uppercase letter</span>
            </div>
            <div class="requirement" data-type="lowercase">
                <span class="requirement-icon">○</span>
                <span class="requirement-text">Lowercase letter</span>
            </div>
            <div class="requirement" data-type="numbers">
                <span class="requirement-icon">○</span>
                <span class="requirement-text">Number</span>
            </div>
            <div class="requirement" data-type="special">
                <span class="requirement-icon">○</span>
                <span class="requirement-text">Special character</span>
            </div>
        </div>
    `;

    container.appendChild(indicator);
}

// Function to update password strength indicator
function updatePasswordStrengthIndicator(fieldId, password) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const indicator = field.parentElement.querySelector('.password-strength-indicator');
    if (!indicator) return;

    const analysis = analyzePassword(password);
    const strengthFill = indicator.querySelector('.strength-fill');
    const strengthText = indicator.querySelector('.strength-text');
    const requirements = indicator.querySelectorAll('.requirement');

    // Update strength bar
    const percentage = (analysis.score / 5) * 100;
    strengthFill.style.width = `${percentage}%`;

    // Update colors and text based on strength
    if (analysis.score === 0) {
        //strengthFill.style.backgroundColor = '#e0e0e0';
        strengthText.textContent = 'Password strength';
        //strengthText.style.color = '#666';
    } else if (analysis.score < 3) {
        strengthFill.style.backgroundColor = '#f44336';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#f44336';
    } else if (analysis.score < 5) {
        strengthFill.style.backgroundColor = '#ff9800';
        strengthText.textContent = 'Medium password';
        strengthText.style.color = '#ff9800';
    } else {
        strengthFill.style.backgroundColor = '#4CAF50';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#4CAF50';
    }

    // Update requirements
    requirements.forEach(req => {
        const type = req.dataset.type;
        const isMet = analysis[type === 'length' ? 'length' :
                            type === 'uppercase' ? 'hasUpperCase' :
                            type === 'lowercase' ? 'hasLowerCase' :
                            type === 'numbers' ? 'hasNumbers' :
                            type === 'special' ? 'hasSpecialChar' : false];

        if (isMet) {
            req.classList.add('met');
        } else {
            req.classList.remove('met');
        }
    });
}

// Function to create password visibility toggle
export function createPasswordToggle(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Skip if already has toggle
    if (field.parentElement.querySelector('.password-toggle-btn')) return;

    // Wrap field in container if not already wrapped
    if (!field.parentElement.classList.contains('password-toggle-container')) {
        const container = document.createElement('div');
        container.className = 'password-toggle-container';
        field.parentElement.insertBefore(container, field);
        container.appendChild(field);
    }

    // Add toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.innerHTML = '👁️';
    toggleBtn.title = 'Show/Hide password';

    // Add padding to field to make room for button
    field.classList.add('password-field-with-toggle');

    toggleBtn.addEventListener('click', function() {
        if (field.type === 'password') {
            field.type = 'text';
            toggleBtn.innerHTML = '🙈';
            toggleBtn.title = 'Hide password';
        } else {
            field.type = 'password';
            toggleBtn.innerHTML = '👁️';
            toggleBtn.title = 'Show password';
        }
    });

    field.parentElement.appendChild(toggleBtn);
}

// function to validate passwords for signup and login forms
export function updatePasswordValidation() {
    const password1Field = document.getElementById('password1');
    const password2Field = document.getElementById('password2');

    // Get global objects from main file
    const validationErrors = window.validationErrors || {};
    const updateSubmitButton = window.updateSubmitButton || function() {};

    // Handle single password field case (login form)
    if (password1Field) {
        const password = password1Field.value;
        password1Field.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation message
        const existingMessage = password1Field.parentElement.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();

        if (password.length === 0) {
            delete validationErrors['password1'];
        } else {
            const analysis = analyzePassword(password);

            if (analysis.isStrong) {
                password1Field.classList.add('char-valid');
                delete validationErrors['password1'];
            } else {
                password1Field.classList.add('char-error');
                validationErrors['password1'] = 'Password must meet all requirements';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors['password1'];
                password1Field.parentElement.appendChild(errorMessage);
            }
        }

        // Update password strength indicator
        updatePasswordStrengthIndicator('password1', password);
    }

    // Handle registration form case (password1 & password2)
    if (password1Field && password2Field) {
        const password1 = password1Field.value;
        const password2 = password2Field.value;

        // Reset previous validation for password2
        password2Field.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation messages for password2
        const existingMessage2 = password2Field.parentElement.querySelector('.validation-message');
        if (existingMessage2) existingMessage2.remove();

        // Validate password2 match
        if (password2.length > 0) {
            if (password1 !== password2) {
                password2Field.classList.add('char-error');
                validationErrors['password2'] = 'Passwords do not match';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors['password2'];
                password2Field.parentElement.appendChild(errorMessage);
            } else if (password1.length > 0 && analyzePassword(password1).isStrong) {
                password2Field.classList.add('char-valid');
                delete validationErrors['password2'];

                const successMessage = document.createElement('div');
                successMessage.className = 'validation-message success';
                successMessage.textContent = 'Passwords match';
                password2Field.parentElement.appendChild(successMessage);
            } else {
                delete validationErrors['password2'];
            }
        } else {
            delete validationErrors['password2'];
        }
    }

    // Update submit button
    updateSubmitButton();
}


/* export function updatePasswordChangeValidation() {
    const oldPasswordField = document.getElementById('id_old_password');
    const newPassword1Field = document.getElementById('id_new_password1');
    const newPassword2Field = document.getElementById('id_new_password2');

    // Get global objects from main file
    const validationErrors = window.validationErrors || {};
    const updateSubmitButton = window.updateSubmitButton || function () { };

    // Handle old password field
    if (oldPasswordField) {
        const oldPassword = oldPasswordField.value;
        oldPasswordField.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation message
        const existingMessage = oldPasswordField.parentElement.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();

        if (oldPassword.length === 0) {
            delete validationErrors['id_old_password'];
        } else {
            oldPasswordField.classList.add('char-valid');
            delete validationErrors['id_old_password'];
        }
        updatePasswordStrengthIndicator('id_old_password', oldPassword);
    }

    // Handle new password fields
    if (newPassword1Field && newPassword2Field) {
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';
        const newPassword1 = newPassword1Field.value;
        const newPassword2 = newPassword2Field.value;

        // Reset previous validation for new passwords
        newPassword1Field.classList.remove('char-warning', 'char-error', 'char-valid');
        newPassword2Field.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation messages for new passwords
        const existingMessage1 = newPassword1Field.parentElement.querySelector('.validation-message');
        if (existingMessage1) existingMessage1.remove();
        const existingMessage2 = newPassword2Field.parentElement.querySelector('.validation-message');
        if (existingMessage2) existingMessage2.remove();

        // Validate new password 1
        if (newPassword1.length > 0) {
            const analysis = analyzePassword(newPassword1);

            if (newPassword1 === oldPassword) {
                newPassword1Field.classList.add('char-error');
                validationErrors['id_new_password1'] = 'New password cannot be the same as old password';
                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors['id_new_password1'];
                newPassword1Field.parentElement.appendChild(errorMessage);
            }

            if (analysis.isStrong) {
                newPassword1Field.classList.add('char-valid');
                delete validationErrors['id_new_password1'];
            } else {
                newPassword1Field.classList.add('char-error');
                validationErrors['id_new_password1'] = 'New password must meet all requirements';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors['id_new_password1'];
                newPassword1Field.parentElement.appendChild(errorMessage);
            }
        } else {
            delete validationErrors['id_new_password1'];
        }
        updatePasswordStrengthIndicator('id_new_password1', newPassword1);
        // Validate new password 2
        if (newPassword2.length > 0) {
            if (newPassword1 !== newPassword2) {
                newPassword2Field.classList.add('char-error');
                validationErrors['id_new_password2'] = 'New passwords do not match';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors['id_new_password2'];
                newPassword2Field.parentElement.appendChild(errorMessage);
            } else if (newPassword1.length > 0 && analyzePassword(newPassword1).isStrong) {
                newPassword2Field.classList.add('char-valid');
                delete validationErrors['id_new_password2'];

                const successMessage = document.createElement('div');
                successMessage.className = 'validation-message success';
                successMessage.textContent = 'New passwords match';
                newPassword2Field.parentElement.appendChild(successMessage);
            } else {
                delete validationErrors['id_new_password2'];
            }
        } else {
            delete validationErrors['id_new_password2'];
        }
    }
    updateSubmitButton();
} */

// function to validate passwords for password change forms
export function updatePasswordChangeValidation() {
    const oldPasswordField = document.getElementById('id_old_password');
    const newPassword1Field = document.getElementById('id_new_password1');
    const newPassword2Field = document.getElementById('id_new_password2');

    // Get global objects from main file
    const validationErrors = window.validationErrors || {};
    const updateSubmitButton = window.updateSubmitButton || function() {};

    // Helper function to clear field validation
    function clearFieldValidation(field, errorKey) {
        if (field) {
            field.classList.remove('char-warning', 'char-error', 'char-valid');
            const existingMessage = field.parentElement.querySelector('.validation-message');
            if (existingMessage) existingMessage.remove();
            delete validationErrors[errorKey];
        }
    }

    // Helper function to set field error
    function setFieldError(field, errorKey, message) {
        if (field) {
            field.classList.add('char-error');
            validationErrors[errorKey] = message;

            const errorMessage = document.createElement('div');
            errorMessage.className = 'validation-message error';
            errorMessage.textContent = message;
            field.parentElement.appendChild(errorMessage);
        }
    }

    // Helper function to set field success
    function setFieldSuccess(field, errorKey, message) {
        if (field) {
            field.classList.add('char-valid');
            delete validationErrors[errorKey];

            const successMessage = document.createElement('div');
            successMessage.className = 'validation-message success';
            successMessage.textContent = message;
            field.parentElement.appendChild(successMessage);
        }
    }

    // Validate old password field
    if (oldPasswordField) {
        const oldPassword = oldPasswordField.value;
        clearFieldValidation(oldPasswordField, 'old_password');

        if (oldPassword.length === 0) {
            // Empty field - no validation needed yet
        } else if (oldPassword.length < 8) {
            // Basic length check for old password (assuming minimum requirements)
            setFieldError(oldPasswordField, 'old_password', 'Current password appears invalid');
        } else {
            // Old password has content and meets basic length - mark as valid for UI
            oldPasswordField.classList.add('char-valid');
        }
    }

    // Validate new password 1
    if (newPassword1Field) {
        const newPassword1 = newPassword1Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';
        
        clearFieldValidation(newPassword1Field, 'new_password1');

        if (newPassword1.length === 0) {
            // Empty field - no validation needed yet
        } else {
            const analysis = analyzePassword(newPassword1);
            
            // Check if new password is same as old password
            if (oldPassword.length > 0 && newPassword1 === oldPassword) {
                setFieldError(newPassword1Field, 'new_password1', 'New password must be different from current password');
            } else if (!analysis.isStrong) {
                setFieldError(newPassword1Field, 'new_password1', 'Password must meet all requirements');
            } else {
                setFieldSuccess(newPassword1Field, 'new_password1', 'Password meets requirements');
            }
        }

        // Update password strength indicator for new password
        updatePasswordStrengthIndicator('id_new_password1', newPassword1);
    }

    // Validate new password 2 (confirmation)
    if (newPassword2Field) {
        const newPassword1 = newPassword1Field ? newPassword1Field.value : '';
        const newPassword2 = newPassword2Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';

        clearFieldValidation(newPassword2Field, 'new_password2');

        if (newPassword2.length === 0) {
            // Empty field - no validation needed yet
        } else {
            // Check if confirmation matches new password
            if (newPassword1 !== newPassword2) {
                setFieldError(newPassword2Field, 'new_password2', 'Passwords do not match');
            } 
            // Check if confirmation is same as old password
            else if (oldPassword.length > 0 && newPassword2 === oldPassword) {
                setFieldError(newPassword2Field, 'new_password2', 'New password must be different from current password');
            }
            // Check if new password meets strength requirements
            else if (newPassword1.length > 0 && !analyzePassword(newPassword1).isStrong) {
                // Don't mark as valid until the first password is strong
                setFieldError(newPassword2Field, 'new_password2', 'New password must meet all requirements');
            }
            // All validations passed
            else if (newPassword1.length > 0) {
                setFieldSuccess(newPassword2Field, 'new_password2', 'Passwords match');
            }
        }
    }

    /*// Additional security validation: Check for common password patterns
    if (newPassword1Field && newPassword1Field.value.length > 0) {
        const newPassword = newPassword1Field.value;
        const oldPassword = oldPasswordField ? oldPasswordField.value : '';

        // Check for simple transformations of old password (if old password is available)
        if (oldPassword.length > 0 && isSimpleTransformation(oldPassword, newPassword)) {
            clearFieldValidation(newPassword1Field, 'new_password1');
            setFieldError(newPassword1Field, 'new_password1', 'New password is too similar to current password');
            
            // Also invalidate the confirmation field
            if (newPassword2Field) {
                clearFieldValidation(newPassword2Field, 'new_password2');
                if (newPassword2Field.value.length > 0) {
                    setFieldError(newPassword2Field, 'new_password2', 'New password is too similar to current password');
                }
            }
        }
    }*/

    // Update submit button state
    updateSubmitButton();
}
/* 
// Helper function to detect simple transformations of old password
function isSimpleTransformation(oldPassword, newPassword) {
    if (!oldPassword || !newPassword || oldPassword === newPassword) {
        return oldPassword === newPassword;
    }

    // Convert to lowercase for comparison
    const oldLower = oldPassword.toLowerCase();
    const newLower = newPassword.toLowerCase();

    // Check if new password is just old password with additions
    if (newLower.includes(oldLower) || oldLower.includes(newLower)) {
        return true;
    }

    // Check for simple character substitutions (like a->@ or e->3)
    const commonSubstitutions = {
        'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '$', 'l': '1'
    };

    let transformedOld = oldLower;
    for (const [char, sub] of Object.entries(commonSubstitutions)) {
        transformedOld = transformedOld.replace(new RegExp(char, 'g'), sub);
    }

    // Check if new password matches transformed old password
    if (newLower === transformedOld) {
        return true;
    }

    // Check reverse transformation
    let transformedNew = newLower;
    for (const [char, sub] of Object.entries(commonSubstitutions)) {
        transformedNew = transformedNew.replace(new RegExp('\\' + sub, 'g'), char);
    }

    if (transformedNew === oldLower) {
        return true;
    }

    // Check for simple reversals or rotations
    if (newLower === oldLower.split('').reverse().join('')) {
        return true;
    }

    return false;
}
 */
