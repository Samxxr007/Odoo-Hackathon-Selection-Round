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
 * Format: 4 uppercase + 4 digits + 4 special chars
 */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%'

  const randomChar = (charset: string) =>
    charset[randomBytes(1)[0] % charset.length]

  const parts = [
    Array.from({ length: 3 }, () => randomChar(upper)).join(''),
    Array.from({ length: 3 }, () => randomChar(lower)).join(''),
    Array.from({ length: 3 }, () => randomChar(digits)).join(''),
    Array.from({ length: 2 }, () => randomChar(special)).join(''),
  ]

  // Shuffle the combined string
  const combined = parts.join('').split('')
  for (let i = combined.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1)
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return combined.join('')
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
} {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters required')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required')
  if (!/[0-9]/.test(password)) errors.push('At least one digit required')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('At least one special character required')

  return { valid: errors.length === 0, errors }
}
