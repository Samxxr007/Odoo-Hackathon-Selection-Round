import { randomBytes } from 'crypto'
import { db } from '@/lib/db'

const TOKEN_EXPIRY_HOURS = 24

/**
 * Generate a cryptographically random verification token.
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Compute the expiry date for a verification token.
 */
export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
}

/**
 * Send a verification email.
 *
 * In production: sends via SMTP (nodemailer) if SMTP_HOST is configured.
 * In development / no SMTP: logs the URL to console and returns the token
 *   in the response (dev-mode fallback).
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ sent: boolean; devToken?: string; devUrl?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const verifyUrl = `${appUrl}/verify-email?token=${token}`

  // Try sending via SMTP if configured
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@odoo-hrms.com',
        to: email,
        subject: 'Verify your HRMS account',
        html: buildVerificationEmailHtml(verifyUrl),
      })

      return { sent: true }
    } catch (error) {
      console.error('[Email] Failed to send verification email:', error)
      // Fall through to dev fallback
    }
  }

  // Dev-mode fallback
  console.log(`\n[DEV] Verification URL for ${email}:\n${verifyUrl}\n`)
  return {
    sent: false,
    devToken: token,
    devUrl: verifyUrl,
  }
}

/**
 * Verify a token: validate it exists, belongs to a user, and hasn't expired.
 * On success, marks the user as verified and clears the token.
 */
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const user = await db.user.findUnique({
    where: { verificationToken: token },
  })

  if (!user) {
    return { success: false, error: 'Invalid verification token' }
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return { success: false, error: 'Verification token has expired. Please request a new one.' }
  }

  if (user.emailVerified) {
    return { success: false, error: 'Email already verified' }
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  })

  return { success: true }
}

function buildVerificationEmailHtml(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #0077FF; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0;">HRMS</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #E5ECF2; border-radius: 0 0 8px 8px;">
      <h2 style="color: #1A1D24;">Verify your email address</h2>
      <p style="color: #8F9CAE;">Click the button below to verify your email and activate your account.</p>
      <a href="${verifyUrl}" 
         style="display: inline-block; background: #0077FF; color: white; padding: 12px 24px; 
                border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">
        Verify Email
      </a>
      <p style="color: #8F9CAE; font-size: 12px;">This link expires in 24 hours.</p>
      <p style="color: #8F9CAE; font-size: 12px;">If you did not create this account, you can safely ignore this email.</p>
    </div>
  </body>
</html>`
}
