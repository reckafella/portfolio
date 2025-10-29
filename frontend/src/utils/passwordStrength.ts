/**
 * Password strength analysis utility
 * Based on the existing JavaScript implementation in app/static/assets/javascript
 */

export interface PasswordAnalysis {
    length: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasSpecialChar: boolean;
    score: number;
    isStrong: boolean;
    isWeak: boolean;
    match?: boolean;
    different?: boolean;
}

/**
 * Analyze password strength
 * @param password - The password to analyze
 * @returns Analysis results with strength indicators
 */
export const analyzePassword = (password: string): PasswordAnalysis => {
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

    const analysis: PasswordAnalysis = {
        length: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        score: 0,
        isStrong: false,
        isWeak: false
    };

    // Length check (1 point)
    if (password.length >= 8) analysis.score += 1;

    // Character types (1 point each)
    if (analysis.hasLowerCase) analysis.score += 1;
    if (analysis.hasUpperCase) analysis.score += 1;
    if (analysis.hasNumbers) analysis.score += 1;
    if (analysis.hasSpecialChar) analysis.score += 1;

    // Determine if password is weak or strong
    analysis.isWeak = analysis.score < 3;
    analysis.isStrong = analysis.score >= 5;

    return analysis;
};

/**
 * Get password strength level as string
 * @param analysis - Password analysis result
 * @returns Strength level: 'weak', 'medium', or 'strong'
 */
export const getPasswordStrengthLevel = (analysis: PasswordAnalysis): 'none' | 'weak' | 'medium' | 'strong' => {
    if (analysis.score === 0) return 'none';
    if (analysis.score < 3) return 'weak';
    if (analysis.score < 5) return 'medium';
    return 'strong';
};

/**
 * Get password strength percentage
 * @param analysis - Password analysis result
 * @returns Percentage (0-100)
 */
export const getPasswordStrengthPercentage = (analysis: PasswordAnalysis): number => {
    if (analysis.score === 0) return 0;
    if (analysis.score < 3) return 33;
    if (analysis.score < 5) return 66;
    return 100;
};

/**
 * Get password strength color
 * @param level - Strength level
 * @returns Color code
 */
export const getPasswordStrengthColor = (level: 'none' | 'weak' | 'medium' | 'strong'): string => {
    switch (level) {
        case 'weak':
            return '#de372b'; // Red
        case 'medium':
            return '#fa8509'; // Orange
        case 'strong':
            return '#067709'; // Green
        default:
            return '#6c757d'; // Gray
    }
};

/**
 * Get password strength text
 * @param level - Strength level
 * @returns Human-readable strength text
 */
export const getPasswordStrengthText = (level: 'none' | 'weak' | 'medium' | 'strong'): string => {
    switch (level) {
        case 'weak':
            return 'Weak password';
        case 'medium':
            return 'Medium password';
        case 'strong':
            return 'Strong password';
        default:
            return 'Password strength';
    }
};
