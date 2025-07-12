
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
        strengthFill.style.backgroundColor = '#e0e0e0';
        strengthText.textContent = 'Password strength';
        strengthText.style.color = '#666';
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

// Function to validate passwords with visual feedback
export function updatePasswordValidation(passwordFields, validationErrors, updateSubmitButton) {
    if (!Array.isArray(passwordFields) || passwordFields.length === 0) return;
    if (typeof validationErrors !== 'object') validationErrors = {};

    const password1Field = document.getElementById(passwordFields[0]);
    const password2Field = document.getElementById(passwordFields[1]);

    // Handle single password field case (login form)
    if (password1Field) {
        const password = password1Field.value;
        password1Field.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation message
        const existingMessage = password1Field.parentElement.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();

        if (password.length === 0) {
            delete validationErrors[passwordFields[0]];
        } else {
            const analysis = analyzePassword(password);

            if (analysis.isStrong) {
                password1Field.classList.add('char-valid');
                delete validationErrors[passwordFields[0]];
            } else {
                password1Field.classList.add('char-error');
                validationErrors[passwordFields[0]] = 'Password must meet all requirements';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors[passwordFields[0]];
                password1Field.parentElement.appendChild(errorMessage);
            }
        }
    }

    // Handle registration form case (password1 & password2)
    if (password1Field && password2Field) {
        const password1 = password1Field.value;
        const password2 = password2Field.value;

        // Reset previous validation
        password1Field.classList.remove('char-warning', 'char-error', 'char-valid');
        password2Field.classList.remove('char-warning', 'char-error', 'char-valid');

        // Remove existing validation messages
        const existingMessage1 = password1Field.parentElement.querySelector('.validation-message');
        if (existingMessage1) existingMessage1.remove();

        const existingMessage2 = password2Field.parentElement.querySelector('.validation-message');
        if (existingMessage2) existingMessage2.remove();

        // Validate password1 strength
        if (password1.length > 0) {
            const analysis = analyzePassword(password1);
            updatePasswordStrengthIndicator(passwordFields[0], password1);

            if (analysis.isStrong) {
                password1Field.classList.add('char-valid');
                delete validationErrors[passwordFields[0]];
            } else {
                password1Field.classList.add('char-error');
                validationErrors[passwordFields[0]] = 'Password must meet all requirements';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors[passwordFields[0]];
                password1Field.parentElement.appendChild(errorMessage);
            }
        } else {
            updatePasswordStrengthIndicator(passwordFields[0], password1);
            delete validationErrors[passwordFields[0]];
        }

        // Validate password2 match
        if (password2.length > 0) {
            if (password1 !== password2) {
                password2Field.classList.add('char-error');
                validationErrors[passwordFields[1]] = 'Passwords do not match';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'validation-message error';
                errorMessage.textContent = validationErrors[passwordFields[1]];
                password2Field.parentElement.appendChild(errorMessage);
            } else if (password1.length > 0 && analyzePassword(password1).isStrong) {
                password2Field.classList.add('char-valid');
                delete validationErrors[passwordFields[1]];

                const successMessage = document.createElement('div');
                successMessage.className = 'validation-message success';
                successMessage.textContent = 'Passwords match';
                password2Field.parentElement.appendChild(successMessage);
            } else {
                delete validationErrors[passwordFields[1]];
            }
        } else {
            delete validationErrors[passwordFields[1]];
        }
    }

    // Update submit button if function exists
    if (typeof updateSubmitButton === 'function') {
        updateSubmitButton();
    }
}
