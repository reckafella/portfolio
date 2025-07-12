function isValidEmail(email) {
    // Input validation
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Trim whitespace and check length constraints
    email = email.trim();

    // RFC 5321 limits: local part ≤ 64 chars, domain ≤ 253 chars, total ≤ 320 chars
    if (email.length === 0 || email.length > 320) {
        return false;
    }

    // Check for exactly one @ symbol
    const atSymbolCount = (email.match(/@/g) || []).length;
    if (atSymbolCount !== 1) {
        return false;
    }

    const [localPart, domain] = email.split('@');

    // Validate local part (before @)
    if (!isValidLocalPart(localPart)) {
        return false;
    }

    // Validate domain part (after @)
    if (!isValidDomain(domain)) {
        return false;
    }

    return true;
}

function isValidLocalPart(localPart) {
    // Check length (RFC 5321: max 64 characters)
    if (!localPart || localPart.length > 64) {
        return false;
    }

    // Check for consecutive dots
    if (localPart.includes('..')) {
        return false;
    }

    // Check for leading/trailing dots
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
    }

    // Allowed characters: a-z, A-Z, 0-9, and these special chars: !#$%&'*+-/=?^_`{|}~
    // Also allow dots (but not consecutive, leading, or trailing - checked above)
    const localPartRegex = /^[a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~.]+$/;
    if (!localPartRegex.test(localPart)) {
        return false;
    }

    return true;
}

function isValidDomain(domain) {
    // Check length (RFC 1035: max 253 characters)
    if (!domain || domain.length > 253) {
        return false;
    }

    // Convert to lowercase for case-insensitive comparison
    domain = domain.toLowerCase();

    // Check for consecutive dots
    if (domain.includes('..')) {
        return false;
    }

    // Check for leading/trailing dots or hyphens
    if (domain.startsWith('.') || domain.endsWith('.') ||
        domain.startsWith('-') || domain.endsWith('-')) {
        return false;
    }

    // Split domain into labels (parts separated by dots)
    const labels = domain.split('.');

    // Must have at least 2 labels (e.g., "example.com")
    if (labels.length < 2) {
        return false;
    }

    // Validate each label
    for (const label of labels) {
        if (!isValidDomainLabel(label)) {
            return false;
        }
    }

    // Top-level domain should be at least 2 characters and contain only letters
    const tld = labels[labels.length - 1];
    if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
        return false;
    }

    return true;
}

function isValidDomainLabel(label) {
    // Each label must be 1-63 characters (RFC 1035)
    if (!label || label.length > 63) {
        return false;
    }

    // Labels cannot start or end with hyphens
    if (label.startsWith('-') || label.endsWith('-')) {
        return false;
    }

    // Labels can contain letters, numbers, and hyphens only
    const labelRegex = /^[a-z0-9-]+$/;
    if (!labelRegex.test(label)) {
        return false;
    }

    return true;
}

/**
 * Secure email validation function that includes additional security checks
 * to prevent injection attacks and homograph attacks.
 * This function builds on the basic email validation
 * and adds checks for suspicious patterns and mixed scripts.
 * */
function isValidEmailSecure(email) {
    // Basic validation first
    if (!isValidEmail(email)) {
        return false;
    }

    email = email.trim().toLowerCase();

    // Additional security checks

    // Check for suspicious patterns that might indicate injection attempts
    const suspiciousPatterns = [
        /[<>]/,                    // HTML/XML tags
        /javascript:/i,            // JavaScript protocol
        /data:/i,                  // Data protocol
        /\r|\n/,                   // Line breaks
        /\0/,                      // Null bytes
        /%[0-9a-f]{2}/i,          // URL encoding
        /\\u[0-9a-f]{4}/i,        // Unicode escapes
        /\x[0-9a-f]{2}/i,         // Hex escapes
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(email)) {
            return false;
        }
    }

    // Check for homograph attacks (mixed scripts)
    const hasLatin = /[a-z]/.test(email);
    const hasCyrillic = /[\u0400-\u04FF]/.test(email);
    const hasGreek = /[\u0370-\u03FF]/.test(email);

    // If email contains mixed scripts, it might be a homograph attack
    const scriptCount = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length;
    if (scriptCount > 1) {
        return false;
    }

    return true;
}

// Function to update email validation
export default function updateEmailValidation(nameFieldId, validationErrors, updateSubmitButton) {
    const emailField = document.getElementById(nameFieldId);
    if (!emailField) return;

    const email = emailField.value.trim();

    // Remove previous classes and messages
    emailField.classList.remove('char-warning', 'char-error', 'char-valid');
    const existingMessage = emailField.parentElement.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (email.length === 0) {
        // Empty field
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
        return;
    } else if (!isValidEmailSecure(email)) {
        // Invalid email format
        emailField.classList.add('char-error');
        if (typeof validationErrors === 'object') {
            validationErrors[nameFieldId] = 'Please enter a valid email address';
        }
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-message error';
        errorMessage.textContent = validationErrors[nameFieldId] || 'Invalid email format';
        emailField.parentElement.appendChild(errorMessage);
    } else {
        // Valid email
        emailField.classList.add('char-valid');
        if (typeof validationErrors === 'object') {
            delete validationErrors[nameFieldId];
        }
    }

    // Update submit button state
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}
