/**
 * Security module exports
 */

// Export password utilities
export { 
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateSecureString,
  createHash
} from './password-utils';

// Export password validation utilities
export {
  validatePasswordStrength,
  getPasswordValidationDetails,
  generateSecurePassword,
  DEFAULT_PASSWORD_CRITERIA
} from './validation/password-validation';

export type {
  PasswordCriteria,
  PasswordValidationDetails,
  PasswordGenerationOptions
} from './validation/password-validation';

// Export other security utilities as they're added
