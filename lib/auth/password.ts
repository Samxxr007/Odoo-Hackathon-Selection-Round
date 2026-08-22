import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12

/**
 * Hash a plain-text password using bcrypt (12 rounds)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * Verify a plain-text password against a bcrypt hash
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash)
}

/**
 * Generate a cryptographically random temporary password.
 * Format: guaranteed uppercase, lowercase, digit, and special char up to length
 */
export function generateTempPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%'

  const randomChar = (charset: string) =>
    charset[randomBytes(1)[0] % charset.length]

  const required = [
    randomChar(upper),
    randomChar(lower),
    randomChar(digits),
    randomChar(special),
  ]

  const all = upper + lower + digits + special
  while (required.length < length) {
    required.push(randomChar(all))
  }

  // Shuffle the combined array
  for (let i = required.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1)
    ;[required[i], required[j]] = [required[j], required[i]]
  }

  return required.join('')
}

/**
 * Validate password strength
 * - Min 8 characters
 * - At least one uppercase
 * - At least one lowercase
 * - At least one digit
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters required')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required')
  if (!/[0-9]/.test(password)) errors.push('At least one digit required')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('At least one special character required')

  const score = Math.max(0, 5 - errors.length)

  return { valid: errors.length === 0, errors, score }
}
