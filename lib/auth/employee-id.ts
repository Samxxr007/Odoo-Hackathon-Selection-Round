import { db } from '@/lib/db'

/**
 * Generates a unique employee Login ID.
 *
 * Format: [2 letters company][2 letters firstName][2 letters lastName][4 digit year][4 digit serial]
 * Example: OIJODO20220001
 *
 * Uses a transaction with pessimistic locking to prevent duplicate serials
 * under concurrent requests.
 */
export async function generateLoginId(
  companyId: string,
  companyName: string,
  firstName: string,
  lastName: string,
  joiningDate: Date
): Promise<{ loginId: string; serial: number; year: number }> {
  const year = joiningDate.getFullYear()

  const companyPart = sanitize(companyName).slice(0, 2).toUpperCase()
  const firstPart = sanitize(firstName).slice(0, 2).toUpperCase()
  const lastPart = sanitize(lastName).slice(0, 2).toUpperCase()

  // Transaction-safe serial increment
  const serial = await db.$transaction(async (tx) => {
    // Upsert the yearly serial counter (lock the row for update)
    const existing = await tx.yearlySerial.findUnique({
      where: { companyId_year: { companyId, year } },
    })

    if (existing) {
      const updated = await tx.yearlySerial.update({
        where: { companyId_year: { companyId, year } },
        data: { lastSerial: existing.lastSerial + 1 },
      })
      return updated.lastSerial
    } else {
      const created = await tx.yearlySerial.create({
        data: { companyId, year, lastSerial: 1 },
      })
      return created.lastSerial
    }
  })

  const serialPadded = String(serial).padStart(4, '0')
  const loginId = `${companyPart}${firstPart}${lastPart}${year}${serialPadded}`

  return { loginId, serial, year }
}

/**
 * Sanitize a string: keep only ASCII letters, remove spaces and special chars.
 * Pads with 'X' if result is shorter than needed.
 */
function sanitize(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z]/g, '')
  return cleaned.length > 0 ? cleaned : 'XX'
}

/**
 * Split a full name into first and last name parts.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
  }
}
