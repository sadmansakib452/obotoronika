// validation.ts

// Regex for Email Validation (standard format)
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Regex for Bangladesh Phone Number Validation
// Validates phone numbers starting with +880 or 880 followed by 9 digits (e.g., +8801XXXXXXXX)
export const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/

/**
 * Validates if the provided value is a valid email address.
 * @param emailOrPhone The string to be validated as an email.
 * @returns true if valid email, otherwise false.
 */
export const validateEmail = (emailOrPhone: string): boolean => {
  return emailRegex.test(emailOrPhone)
}

/**
 * Validates if the provided value is a valid Bangladeshi phone number.
 * @param emailOrPhone The string to be validated as a phone number.
 * @returns true if valid phone number, otherwise false.
 */
export const validatePhoneNumber = (emailOrPhone: string): boolean => {
  return phoneRegex.test(emailOrPhone)
}
