/**
 * South African ID Number Validator
 *
 * SA ID Format (13 digits):
 * - Positions 1-6: Date of birth (YYMMDD)
 * - Positions 7-10: Gender (0000-4999 = female, 5000-9999 = male)
 * - Position 11: Citizenship (0 = SA citizen, 1 = permanent resident)
 * - Position 12: Usually 8 or 9 (historical)
 * - Position 13: Checksum (Luhn algorithm)
 *
 * Privacy Note: This validation happens in-memory and no data is logged.
 */

import type { SAIDValidationResult } from '@amu/shared';

/**
 * Validate a South African ID number using the Luhn algorithm
 * and extract demographic information
 */
export function validateSAID(idNumber: string): SAIDValidationResult {
  // Remove any spaces or dashes
  const cleanId = idNumber.replace(/[\s-]/g, '');

  // Check length
  if (cleanId.length !== 13) {
    return {
      valid: false,
      checksum_valid: false,
      error: 'ID number must be exactly 13 digits',
    };
  }

  // Check if all characters are digits
  if (!/^\d{13}$/.test(cleanId)) {
    return {
      valid: false,
      checksum_valid: false,
      error: 'ID number must contain only digits',
    };
  }

  // Extract components
  const yearPart = cleanId.substring(0, 2);
  const monthPart = cleanId.substring(2, 4);
  const dayPart = cleanId.substring(4, 6);
  const genderPart = parseInt(cleanId.substring(6, 10), 10);
  const citizenshipPart = cleanId.charAt(10);

  // Validate Luhn checksum
  const checksumValid = validateLuhnChecksum(cleanId);
  if (!checksumValid) {
    return {
      valid: false,
      checksum_valid: false,
      error: 'Invalid ID number checksum',
    };
  }

  // Parse date of birth
  const month = parseInt(monthPart, 10);
  const day = parseInt(dayPart, 10);

  // Validate month
  if (month < 1 || month > 12) {
    return {
      valid: false,
      checksum_valid: true,
      error: 'Invalid month in ID number',
    };
  }

  // Validate day (basic check)
  if (day < 1 || day > 31) {
    return {
      valid: false,
      checksum_valid: true,
      error: 'Invalid day in ID number',
    };
  }

  // Determine century for year
  // IDs issued after 2000 have years 00-25 (current)
  // IDs issued before 2000 have years 26-99
  const currentYear = new Date().getFullYear();
  const currentYearShort = currentYear % 100;
  const year = parseInt(yearPart, 10);

  let fullYear: number;
  if (year <= currentYearShort) {
    fullYear = 2000 + year;
  } else {
    fullYear = 1900 + year;
  }

  // Validate the date is not in the future
  const dateOfBirth = new Date(fullYear, month - 1, day);
  if (dateOfBirth > new Date()) {
    return {
      valid: false,
      checksum_valid: true,
      error: 'Date of birth cannot be in the future',
    };
  }

  // Validate person is at least 13 years old (minimum for SETA registration)
  const minAge = 13;
  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - minAge);
  if (dateOfBirth > minBirthDate) {
    return {
      valid: false,
      checksum_valid: true,
      error: 'Person must be at least 13 years old',
    };
  }

  // Determine gender
  const gender = genderPart >= 5000 ? 'male' : 'female';

  // Determine citizenship
  const citizenship = citizenshipPart === '0' ? 'citizen' : 'permanent_resident';

  // Format date as YYYY-MM-DD
  const dobFormatted = `${fullYear}-${monthPart}-${dayPart}`;

  return {
    valid: true,
    checksum_valid: true,
    date_of_birth: dobFormatted,
    gender,
    citizenship,
  };
}

/**
 * Validate Luhn checksum for SA ID
 * The Luhn algorithm (also known as mod 10) is used to validate SA IDs
 */
function validateLuhnChecksum(idNumber: string): boolean {
  let sum = 0;
  let alternate = false;

  // Process from right to left
  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber.charAt(i), 10);

    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }

    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

/**
 * Extract date of birth from ID without full validation
 * Used for quick form auto-fill
 */
export function extractDOBFromID(idNumber: string): string | null {
  const cleanId = idNumber.replace(/[\s-]/g, '');

  if (cleanId.length < 6 || !/^\d{6}/.test(cleanId)) {
    return null;
  }

  const yearPart = cleanId.substring(0, 2);
  const monthPart = cleanId.substring(2, 4);
  const dayPart = cleanId.substring(4, 6);

  const year = parseInt(yearPart, 10);
  const currentYearShort = new Date().getFullYear() % 100;

  const fullYear = year <= currentYearShort ? 2000 + year : 1900 + year;

  return `${fullYear}-${monthPart}-${dayPart}`;
}

/**
 * Extract gender from ID without full validation
 * Used for quick form auto-fill
 */
export function extractGenderFromID(idNumber: string): 'male' | 'female' | null {
  const cleanId = idNumber.replace(/[\s-]/g, '');

  if (cleanId.length < 10 || !/^\d{10}/.test(cleanId.substring(0, 10))) {
    return null;
  }

  const genderPart = parseInt(cleanId.substring(6, 10), 10);
  return genderPart >= 5000 ? 'male' : 'female';
}

/**
 * Mask an ID number for display (privacy protection)
 * Shows only first 6 digits (DOB) and masks the rest
 */
export function maskIDNumber(idNumber: string): string {
  const cleanId = idNumber.replace(/[\s-]/g, '');

  if (cleanId.length !== 13) {
    return '***********';
  }

  return cleanId.substring(0, 6) + '*******';
}

/**
 * Compare two dates for matching (extracted vs submitted)
 * Returns true if they match within a reasonable tolerance
 */
export function datesMatch(date1: string, date2: string): boolean {
  // Normalize both dates to YYYY-MM-DD format
  const normalize = (d: string) => {
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split('T')[0];
  };

  const norm1 = normalize(date1);
  const norm2 = normalize(date2);

  if (!norm1 || !norm2) return false;

  return norm1 === norm2;
}

/**
 * Compare gender values (handles different formats)
 */
export function gendersMatch(
  idGender: 'male' | 'female',
  formGender: string
): boolean {
  const normalizedForm = formGender.toLowerCase().trim();

  if (idGender === 'male') {
    return ['male', 'm', 'man', 'mr'].includes(normalizedForm);
  } else {
    return ['female', 'f', 'woman', 'ms', 'mrs', 'miss'].includes(normalizedForm);
  }
}
