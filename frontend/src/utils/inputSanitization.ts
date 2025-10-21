/**
 * Input sanitization utilities for security
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitizes HTML content by escaping special characters
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes text input by trimming and removing dangerous characters
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Sanitizes text input during typing without trimming spaces
 * Use this for onChange events to allow natural typing with spaces
 */
export function sanitizeTextDuringInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    // Don't trim - allow spaces during typing
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, ''); // Keep only alphanumeric, @, ., and -
}

/**
 * Validates and sanitizes phone numbers
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[^\d\s+\-()]/g, ''); // Keep only digits, spaces, +, -, (, )
}

/**
 * Sanitizes array of strings (for skills, responsibilities, etc.)
 * Filters out empty items - use for final submission
 */
export function sanitizeStringArray(input: string[]): string[] {
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => sanitizeText(item))
    .filter(item => item.length > 0); // Remove empty items
}

/**
 * Sanitizes array of strings during input without filtering empty items
 * Use this for onChange events to allow adding empty items that users will fill in
 */
export function sanitizeStringArrayDuringInput(input: string[]): string[] {
  if (!Array.isArray(input)) return [];
  
  return input.map(item => sanitizeTextDuringInput(item));
}

/**
 * Validates URL format
 */
export function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates email format
 */
export function isValidEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Validates that input contains only alphanumeric characters and common punctuation
 */
export function isValidText(input: string): boolean {
  const textRegex = /^[a-zA-Z0-9\s.,!?\-_()]+$/;
  return textRegex.test(input);
}
