/**
 * Utility functions for AMU Platform
 */

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomPart}`;
}

/**
 * Generate random alphanumeric characters (excluding confusing chars)
 * Uses: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no I, O, 0, 1)
 */
export function generateRandomChars(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

/**
 * Generate a referral code from a name
 * Format: {FIRSTNAME}-{4-8 random chars}
 * Example: JOHN-A3K7 or SARAH-M2N9K8L6
 */
export function generateReferralCode(name: string): string {
  const firstName = name.split(' ')[0]?.toUpperCase().slice(0, 10) || 'USER';
  const randomLength = Math.floor(Math.random() * 5) + 4; // 4-8 chars
  const randomPart = generateRandomChars(randomLength);
  return `${firstName}-${randomPart}`;
}

/**
 * Generate a company code
 * Format: {COMPANY}-{6 random chars}
 * Example: MININGCORP-ABC123
 */
export function generateCompanyCode(companyName: string): string {
  const cleanName = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);
  const randomPart = generateRandomChars(6);
  return `${cleanName}-${randomPart}`;
}

/**
 * Generate a certificate verification code
 * Format: AMU-{8 random chars}
 */
export function generateCertificateCode(): string {
  return `AMU-${generateRandomChars(8)}`;
}

/**
 * Format currency in ZAR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
